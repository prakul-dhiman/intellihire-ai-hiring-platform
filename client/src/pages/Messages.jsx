import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiPaperAirplane } from 'react-icons/hi2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/Motion';

export default function Messages() {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const endRef = useRef(null);

    // Initial load: parse if we came with a specific user to message
    const initialPartnerId = new URLSearchParams(location.search).get('user');

    useEffect(() => {
        const fetchConvs = async () => {
            try {
                const res = await api.get('/messages/conversations');
                let convs = res.data.data;

                // If we navigated here to message a specific user not in our history,
                // we should add a dummy conversation block for them.
                if (initialPartnerId && !convs.find(c => c.partner?._id === initialPartnerId)) {
                    // Fetch that user's details just so we can show their name
                    try {
                        const userRes = await api.get(`/auth/users/${initialPartnerId}`);
                        convs = [{
                            partner: userRes.data.data,
                            latestMessage: null,
                            unreadCount: 0
                        }, ...convs];
                    } catch (e) { console.error("Could not fetch user info"); }
                }

                setConversations(convs);

                // Select active conversation
                if (initialPartnerId) {
                    const idx = convs.findIndex(c => c.partner?._id === initialPartnerId);
                    if (idx !== -1) setActiveConv(convs[idx].partner);
                } else if (convs.length > 0) {
                    setActiveConv(convs[0].partner);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchConvs();
    }, [initialPartnerId]);

    // Connect socket
    useEffect(() => {
        if (!user) return;
        const newSocket = io(window.location.origin, {
            withCredentials: true,
            path: '/socket.io',
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join-chat', user.id);
        });

        return () => newSocket.disconnect();
    }, [user]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            if (activeConv && (msg.sender === activeConv._id || msg.receiver === activeConv._id)) {
                setMessages(prev => [...prev, msg]);
            }

            // Re-fetch conversations to update latest message and unread count
            api.get('/messages/conversations').then(res => {
                setConversations(res.data.data);
            });
        };

        socket.on('new-message', handleNewMessage);
        return () => socket.off('new-message', handleNewMessage);
    }, [socket, activeConv]);

    // Fetch messages when activeConv changes
    useEffect(() => {
        if (!activeConv) return;
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${activeConv._id}`);
                setMessages(res.data.data);

                // Mark locally as read
                setConversations(prev => prev.map(c =>
                    c.partner._id === activeConv._id ? { ...c, unreadCount: 0 } : c
                ));
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [activeConv]);

    // Scroll to bottom
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeConv) return;

        const content = input.trim();
        setInput('');

        // Optimistic UI update
        const tempMsg = {
            _id: Date.now().toString(),
            sender: user.id,
            receiver: activeConv._id,
            content,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await api.post('/messages/send', { receiverId: activeConv._id, content });
            // The real message will replace/append on next fetch or we can just rely on the optimistic update
            // and maybe update the conversations list.
            const res = await api.get('/messages/conversations');
            setConversations(res.data.data);
        } catch (err) {
            console.error("Failed to send message", err);
            // Revert optimistic update ideally
        }
    };

    return (
        <PageTransition>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Messages</h1>

                <div style={{ flex: 1, backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', display: 'flex', overflow: 'hidden' }}>

                    {/* Left Sidebar - Conversations */}
                    <div style={{ width: '320px', borderRight: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(15,23,42,0.4)' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Recent Chats</h2>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {conversations.length === 0 ? (
                                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No conversations yet.</div>
                            ) : (
                                conversations.map(c => (
                                    <div
                                        key={c.partner._id}
                                        onClick={() => setActiveConv(c.partner)}
                                        style={{
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            backgroundColor: activeConv?._id === c.partner._id ? 'rgba(99,102,241,0.1)' : 'transparent',
                                            borderLeft: activeConv?._id === c.partner._id ? '3px solid #818cf8' : '3px solid transparent',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc', flexShrink: 0 }}>
                                            <HiOutlineUser size={20} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{c.partner.name}</span>
                                                {c.unreadCount > 0 && (
                                                    <span style={{ backgroundColor: '#6366f1', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px' }}>{c.unreadCount}</span>
                                                )}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.latestMessage ? c.latestMessage.content : `Start chatting...`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side - Chat Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(7,9,15,0.3)' }}>
                        {activeConv ? (
                            <>
                                {/* Chat Header */}
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(30,27,75,0.4)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
                                        <HiOutlineUser size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{activeConv.name}</h2>
                                        <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'capitalize' }}>{activeConv.role}</div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {messages.length === 0 ? (
                                        <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                                            Say hi to {activeConv.name}! 👋
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const isMe = msg.sender === user.id || msg.sender?._id === user.id;
                                            return (
                                                <motion.div
                                                    key={msg._id || i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                                                >
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        padding: '12px 18px',
                                                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                                        backgroundColor: isMe ? '#4f46e5' : 'rgba(30,41,59,0.8)',
                                                        color: '#fff',
                                                        fontSize: '15px',
                                                        lineHeight: '1.5',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}>
                                                        {msg.content}
                                                        <div style={{ fontSize: '11px', color: isMe ? '#a5b4fc' : '#94a3b8', marginTop: '6px', textAlign: isMe ? 'right' : 'left' }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                    <div ref={endRef} />
                                </div>

                                {/* Message Input */}
                                <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(99,102,241,0.15)', backgroundColor: 'rgba(30,27,75,0.4)' }}>
                                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Type your message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            style={{ flex: 1, padding: '14px 20px', borderRadius: '12px' }}
                                        />
                                        <button type="submit" className="btn-primary" style={{ padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>Send</span>
                                            <HiPaperAirplane size={18} style={{ transform: 'rotate(90deg)' }} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

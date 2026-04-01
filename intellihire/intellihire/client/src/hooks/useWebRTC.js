import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

/**
 * useWebRTC — handles WebRTC peer connection + Socket.io signaling
 *
 * @param {string}  sessionCode  — room identifier (the 6-char session code)
 * @param {string}  role         — 'recruiter' | 'candidate'
 * @param {boolean} enabled      — only connect when true (prevents camera on lobby/create phases)
 */
export function useWebRTC({ sessionCode, role, enabled }) {
    const localVideoRef = useRef(null);   // recruiter's own cam (or candidate's cam)
    const remoteVideoRef = useRef(null);   // the other person's cam

    const pcRef = useRef(null);   // RTCPeerConnection
    const socketRef = useRef(null);   // Socket.io

    const [connected, setConnected] = useState(false);   // socket connected
    const [peerConnected, setPeerConnected] = useState(false);   // WebRTC ICE connected
    const [localReady, setLocalReady] = useState(false);   // local cam is live
    const [error, setError] = useState('');

    // ─── Chat relay helpers (exposed so component can send chat via socket) ──
    const sendChatMsg = useCallback((text) => {
        socketRef.current?.emit('chat-message', { roomId: sessionCode, from: role, text });
    }, [sessionCode, role]);

    const sendCodeChange = useCallback((code) => {
        socketRef.current?.emit('code-change', { roomId: sessionCode, code });
    }, [sessionCode]);

    useEffect(() => {
        if (!enabled || !sessionCode) return;

        let localStream = null;
        let isMounted = true;

        // ── 1. Get local camera + mic ──────────────────────────────────────
        async function startMedia() {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isMounted) { localStream.getTracks().forEach(t => t.stop()); return; }
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }
                setLocalReady(true);
                return localStream;
            } catch (err) {
                setError('Camera/mic access denied. Please allow permissions.');
                return null;
            }
        }

        // ── 2. Create RTCPeerConnection ─────────────────────────────────────
        function createPC(stream) {
            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Add local tracks to peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // When remote track arrives, display it
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // ICE candidates → relay via socket
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current?.emit('ice-candidate', {
                        roomId: sessionCode,
                        candidate: event.candidate,
                    });
                }
            };

            // Track ICE connection state
            pc.oniceconnectionstatechange = () => {
                const s = pc.iceConnectionState;
                console.log('[WebRTC] ICE state:', s);
                if (s === 'connected' || s === 'completed') setPeerConnected(true);
                if (s === 'disconnected' || s === 'failed' || s === 'closed') setPeerConnected(false);
            };

            pcRef.current = pc;
            return pc;
        }

        // ── 3. Connect Socket.io ────────────────────────────────────────────
        async function init() {
            const stream = await startMedia();
            if (!stream || !isMounted) return;

            const socket = io(window.location.origin, {
                transports: ['websocket'],
                withCredentials: true,
                path: '/socket.io',
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                setConnected(true);
                socket.emit('join-room', { roomId: sessionCode, role });
            });

            socket.on('disconnect', () => setConnected(false));

            // ── Recruiter creates offer when candidate joins ─────────────
            socket.on('peer-joined', async () => {
                if (role === 'candidate') {
                    // Notify component to send current code to the new recruiter
                    window.dispatchEvent(new CustomEvent('rtc-sync-request'));
                }
                
                if (role !== 'recruiter') return;
                const pc = createPC(stream);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', { roomId: sessionCode, offer });
            });

            // ── Candidate receives offer → sends answer ──────────────────
            socket.on('offer', async ({ offer }) => {
                if (role !== 'candidate') return;
                const pc = createPC(stream);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', { roomId: sessionCode, answer });
            });

            // ── Recruiter receives answer ────────────────────────────────
            socket.on('answer', async ({ answer }) => {
                if (role !== 'recruiter') return;
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
            });

            // ── ICE candidate received ───────────────────────────────────
            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.warn('[WebRTC] ICE add error:', e);
                }
            });

            // ── Incoming chat from the other peer ───────────────────────
            socket.on('chat-message', ({ from, text }) => {
                window.dispatchEvent(new CustomEvent('rtc-chat', { detail: { from, text } }));
            });

            // ── Incoming code change ────────────────────────────────────
            socket.on('code-change', ({ code }) => {
                window.dispatchEvent(new CustomEvent('rtc-code', { detail: { code } }));
            });

            // ── Peer disconnected ────────────────────────────────────────
            socket.on('peer-left', () => {
                setPeerConnected(false);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            });
        }

        init();

        // ── Cleanup ─────────────────────────────────────────────────────────
        return () => {
            isMounted = false;
            localStream?.getTracks().forEach(t => t.stop());
            pcRef.current?.close();
            socketRef.current?.disconnect();
            pcRef.current = null;
            socketRef.current = null;
            setConnected(false);
            setPeerConnected(false);
            setLocalReady(false);
        };
    }, [enabled, sessionCode, role]);

    return {
        localVideoRef,
        remoteVideoRef,
        connected,
        peerConnected,
        localReady,
        error,
        sendChatMsg,
        sendCodeChange,
    };
}

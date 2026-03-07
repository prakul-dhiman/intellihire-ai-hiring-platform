const Message = require("../models/Message");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Get chat history with a specific user
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId },
            ],
        }).sort({ createdAt: 1 });

        // Mark as read
        await Message.updateMany(
            { sender: userId, receiver: myId, read: false },
            { $set: { read: true } }
        );

        successResponse(res, 200, "Messages fetched successfully", messages);
    } catch (error) {
        errorResponse(res, 500, "Failed to fetch messages");
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, fileUrl } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return errorResponse(res, 400, "Receiver ID and content are required");
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content,
            fileUrl, // optional
        });

        // Trigger socket.io event for real-time delivery
        const io = req.app.get("socketio");
        if (io) {
            io.to(receiverId.toString()).emit("new-message", message);
        }

        successResponse(res, 201, "Message sent successfully", message);
    } catch (error) {
        errorResponse(res, 500, "Failed to send message: " + error.message);
    }
};

// Get list of users the current user has chatted with
exports.getConversations = async (req, res) => {
    try {
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }],
        })
            .sort({ createdAt: -1 })
            .populate("sender", "name email role")
            .populate("receiver", "name email role");

        // Map to unique conversations with latest message
        const conversationsMap = new Map();

        messages.forEach((msg) => {
            const partnerId = msg.sender._id.toString() === myId.toString()
                ? msg.receiver._id.toString()
                : msg.sender._id.toString();

            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partner: msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender,
                    latestMessage: msg,
                    unreadCount: (msg.receiver._id.toString() === myId.toString() && !msg.read) ? 1 : 0
                });
            } else if (msg.receiver._id.toString() === myId.toString() && !msg.read) {
                const conv = conversationsMap.get(partnerId);
                conv.unreadCount += 1;
            }
        });

        // Also fetch any applied recruiters or candidates for recruiters if no previous message exists
        // (A bit complex, so we'll just return established conversations for now, but people can start new ones via the UI)

        successResponse(res, 200, "Conversations fetched", Array.from(conversationsMap.values()));
    } catch (error) {
        errorResponse(res, 500, "Failed to fetch conversations");
    }
};

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.set("socketio", io);

// ── WebRTC Signaling Rooms ──────────────────────────
// roomId → { recruiter: socketId, candidate: socketId }
const rooms = {};

io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Chat room for personal messages (private messages)
    socket.on("join-chat", (userId) => {
        socket.join(userId);
        console.log(`💬 User joined personal chat channel: ${userId}`);
    });

    socket.on("join-room", ({ roomId, role }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = {};
        rooms[roomId][role] = socket.id;

        console.log(`👤 ${role} joined room ${roomId}`);

        // Tell the other peer someone joined
        socket.to(roomId).emit("peer-joined", { role });

        // If recruiter is joining AND candidate is already in room, trigger offer creation for recruiter
        if (role === 'recruiter' && rooms[roomId]['candidate']) {
            socket.emit('peer-joined', { role: 'candidate' });
        }
    });

    socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", { offer });
    });

    socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("ice-candidate", { candidate });
    });

    socket.on("chat-message", ({ roomId, from, text }) => {
        socket.to(roomId).emit("chat-message", { from, text });
    });

    socket.on("disconnect", () => {
        // Clean up room entries
        for (const roomId in rooms) {
            const room = rooms[roomId];
            for (const role in room) {
                if (room[role] === socket.id) {
                    delete room[role];
                    socket.to(roomId).emit("peer-left", { role });
                    console.log(`👋 ${role} left room ${roomId}`);
                }
            }
            if (Object.keys(room).length === 0) delete rooms[roomId];
        }
        console.log("❌ Socket disconnected:", socket.id);
    });
});

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
        console.log(`🔗 Socket.io ready for WebRTC signaling`);
    });
});
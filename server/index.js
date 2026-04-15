const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables before anything else
dotenv.config();

// Import database connection
const connectDB = require('./config/db.js');
const { validateEnvironment } = require('./config/validate.js');

// Validate environment variables early
validateEnvironment();

// Import the separated Express app
const app = require('./app.js');
const { getAllowedOrigins } = require('./config/corsOrigins.js');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── HTTP server for Socket.io ────────────────────────────────────
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
        const allowedPaths = getAllowedOrigins();

        const isAllowed = !origin ||
                         allowedPaths.includes(origin) ||
                         NODE_ENV === 'development' ||
                         (origin && origin.endsWith('.vercel.app'));

        callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
});

app.set('socketio', io); // Important to expose io to controllers

// ─── Socket.io Logic ─────────────────────────────────────────────
const rooms = {};

io.on('connection', (socket) => {
  console.log(`✅ User linked: ${socket.id}`);

  socket.on('join-chat', (id) => {
    socket.join(id);
    console.log(`💬 User joined chat channel: ${id}`);
  });

  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][role] = socket.id;
    socket.to(roomId).emit("peer-joined", { role });
    
    if (role === 'recruiter' && rooms[roomId]['candidate']) {
        socket.emit('peer-joined', { role: 'candidate' });
    }
    if (role === 'candidate' && rooms[roomId]['recruiter']) {
        socket.emit('peer-joined', { role: 'recruiter' });
    }
    console.log(`🚪 ${role} joined room: ${roomId}`);
  });

  socket.on("offer", ({ roomId, offer }) => socket.to(roomId).emit("offer", { offer }));
  socket.on("answer", ({ roomId, answer }) => socket.to(roomId).emit("answer", { answer }));
  socket.on("ice-candidate", ({ roomId, candidate }) => socket.to(roomId).emit("ice-candidate", { candidate }));

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  socket.on("sync-code", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      for (const role in rooms[roomId]) {
        if (rooms[roomId][role] === socket.id) {
          delete rooms[roomId][role];
          io.to(roomId).emit('peer-left', { role });
          console.log(`🚪 ${role} left room: ${roomId}`);
        }
      }
      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

// ─── Start Server ───────────────────────────────────────────────
// ─── Keep-Alive Ping (prevents Render free-tier sleep) ──────────
const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function startKeepAlive() {
  const renderUrl = process.env.RENDER_EXTERNAL_URL; // Render sets this automatically
  if (!renderUrl) {
    console.log('[KeepAlive] No RENDER_EXTERNAL_URL found — skipping self-ping (dev mode).');
    return;
  }
  console.log(`[KeepAlive] Pinging ${renderUrl}/api/health every 14 min to prevent sleep.`);
  setInterval(async () => {
    try {
      const https = require('https');
      https.get(`${renderUrl}/api/health`, (res) => {
        console.log(`[KeepAlive] Ping response: ${res.statusCode}`);
      }).on('error', (err) => {
        console.warn(`[KeepAlive] Ping failed: ${err.message}`);
      });
    } catch (err) {
      console.warn(`[KeepAlive] Ping error: ${err.message}`);
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}

const start = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 IntelliHire Server Running (Env: ${NODE_ENV}) on port ${PORT}`);
      startKeepAlive();
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
};

start();

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const initializeSocket = (io: Server) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Join a room based on thread ID
    socket.on("joinThread", (threadId: string) => {
      socket.join(`thread_${threadId}`);
      console.log(`User ${socket.data.user.id} joined thread ${threadId}`);
    });

    // Leave a room based on thread ID
    socket.on("leaveThread", (threadId: string) => {
      socket.leave(`thread_${threadId}`);
      console.log(`User ${socket.data.user.id} left thread ${threadId}`);
    });

    // Handle new message emitted from client (or we can just use REST and emit from there)
    // We'll use REST for posting to DB, and then the server emits to socket.
    // So here we just expose a way for the REST controller to broadcast, or we can handle it via the io instance.

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });
};

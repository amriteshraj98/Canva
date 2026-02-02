const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { addStroke, undo, redo, getState } = require('./drawing-state');
const { addUser, removeUser, updateCursor, getUsers } = require('./rooms');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity in this assignment
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle Joining
  socket.on('join_room', (userData) => {
    const user = addUser(socket.id, userData || {});
    
    // Send current state to new user
    const { history } = getState();
    socket.emit('room_joined', { 
      users: getUsers(), 
      history 
    });

    // Notify others
    socket.broadcast.emit('user_joined', user);
  });

  // Handle Drawing
  socket.on('draw_start', (data) => {
    // data: { x, y, color, width }
    socket.broadcast.emit('draw_started', { userId: socket.id, ...data });
  });

  socket.on('draw_point', (data) => {
    // data: { x, y }
    socket.broadcast.emit('draw_point', { userId: socket.id, ...data });
  });

  socket.on('draw_end', (strokeData) => {
    // strokeData: { points: [], color, width, ... }
    // The client sends the final stroke to be saved in history
    if (strokeData && strokeData.points && strokeData.points.length > 0) {
      const newHistory = addStroke({
        userId: socket.id,
        id: strokeData.id, // Client generated UUID
        color: strokeData.color,
        width: strokeData.width,
        points: strokeData.points,
        isErasing: strokeData.isErasing || false
      });
      
      // We don't need to broadcast history here if clients are already up to date via draw_point.
      // But we should broadcast 'draw_ended' so clients can finalize the stroke locally if needed.
      socket.broadcast.emit('draw_ended', { userId: socket.id });
    }
  });

  // Handle Cursor
  socket.on('cursor_move', (data) => {
    updateCursor(socket.id, data.x, data.y);
    socket.broadcast.emit('cursor_update', { userId: socket.id, x: data.x, y: data.y });
  });

  // Handle Undo/Redo
  socket.on('undo', () => {
    const newHistory = undo();
    if (newHistory) {
      io.emit('history_sync', { history: newHistory });
    }
  });

  socket.on('redo', () => {
    const newHistory = redo();
    if (newHistory) {
      io.emit('history_sync', { history: newHistory });
    }
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit('user_left', { userId: socket.id });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

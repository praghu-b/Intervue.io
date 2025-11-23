const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'], 
        methods: ['GET', 'POST']
    }
});

const PORT = 5000;

// --- STATE MANAGEMENT ---
let connectedUsers = {};
let pollHistory = [];
let pollState = {
    question: null,
    options: [],
    status: 'IDLE',
    timeLeft: 60,
    votedStudents: []
};
let pollTimer = null;

// --- HELPER: END POLL ---
const endPoll = () => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    pollState.status = 'RESULTS';
    pollState.timeLeft = 0;

    // Save to History
    pollHistory.push(JSON.parse(JSON.stringify(pollState))); // Deep copy

    // Broadcast final results to everyone
    io.emit('poll:update', pollState);
    io.emit('poll:history', pollHistory);
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. USER JOIN
    socket.on('user:join', ({ name, type }) => {
        connectedUsers[socket.id] = { id: socket.id, name, type };
        
        // Send initial data to the new user
        socket.emit('poll:update', pollState);
        socket.emit('poll:history', pollHistory);
        
        // Update participant list for everyone (Teacher needs this)
        io.emit('user:list', Object.values(connectedUsers));
    });

    // 2. TEACHER: ASK QUESTION
    socket.on('teacher:ask', ({ question, options }) => {
        // CONSTRAINT: Block if a poll is currently active
        if (pollState.status === 'VOTING') return;

        // Reset State for new poll
        pollState = {
            question,
            options: options.map((text, index) => ({ id: index, text, votes: 0 })),
            status: 'VOTING',
            timeLeft: 60,
            votedStudents: []
        };

        // Broadcast new poll to all students
        io.emit('poll:update', pollState);

        // Start 60s Timer
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(() => {
            pollState.timeLeft -= 1;
            io.emit('timer:update', pollState.timeLeft);

            if (pollState.timeLeft <= 0) {
                endPoll(); // Time limit reached
            }
        }, 1000);
    });

    // 3. STUDENT: VOTE
    socket.on('student:vote', ({ optionId }) => {
        if (pollState.status !== 'VOTING') return;
        if (pollState.votedStudents.includes(socket.id)) return; // Prevent double vote

        // Record Vote
        const option = pollState.options.find(opt => opt.id === optionId);
        if (option) {
            option.votes++;
            pollState.votedStudents.push(socket.id);
            
            // Broadcast update (so Teacher sees live results)
            io.emit('poll:update', pollState);

            // CONSTRAINT: Check if ALL active students have voted
            const activeStudents = Object.values(connectedUsers).filter(u => u.type === 'student');
            if (pollState.votedStudents.length === activeStudents.length) {
                endPoll(); // All students answered, show results immediately
            }
        }
    });

    // 4. CHAT MESSAGE
    socket.on('chat:send', (message) => {
        const user = connectedUsers[socket.id];
        if (user) {
            // Broadcast to everyone including sender
            io.emit('chat:receive', { 
                text: message, 
                sender: user.name, 
                senderId: socket.id 
            });
        }
    });

    // 5. KICK STUDENT
    socket.on('teacher:kick', (studentSocketId) => {
        // Notify the specific student they are kicked
        io.to(studentSocketId).emit('user:kicked');
        
        // Force disconnect socket
        io.sockets.sockets.get(studentSocketId)?.disconnect(true);
        
        // Remove from list and update everyone
        if (connectedUsers[studentSocketId]) {
            delete connectedUsers[studentSocketId];
            io.emit('user:list', Object.values(connectedUsers));
        }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
        if (connectedUsers[socket.id]) {
            delete connectedUsers[socket.id];
            io.emit('user:list', Object.values(connectedUsers));
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
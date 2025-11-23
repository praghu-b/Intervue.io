const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://intervue-io-poll-seven.vercel.app'],
        methods: ['GET', 'POST']
    }
});

const PORT = 5000;


let connectedUsers = {};
let pollHistory = [];
let pollState = {
    question: null,
    options: [],
    status: 'IDLE',
    timeLeft: 60,
    votedStudents: [],
    correctAnswerIndex: null
};
let pollTimer = null;


const endPoll = () => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    pollState.status = 'RESULTS';
    pollState.timeLeft = 0;

    
    pollHistory.push(JSON.parse(JSON.stringify(pollState))); 

    
    io.emit('poll:update', pollState);
    io.emit('poll:history', pollHistory);
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    
    socket.on('user:join', ({ name, type }) => {
        connectedUsers[socket.id] = { id: socket.id, name, type };

        
        socket.emit('poll:update', pollState);
        socket.emit('poll:history', pollHistory);

        
        io.emit('user:list', Object.values(connectedUsers));
    });

    
    socket.on('teacher:ask', ({ question, options, correctAnswerIndex }) => {
        
        if (pollState.status === 'VOTING') return;

        
        pollState = {
            question,
            options: options.map((text, index) => ({ id: index, text, votes: 0 })),
            status: 'VOTING',
            timeLeft: 60,
            votedStudents: [],
            correctAnswerIndex: correctAnswerIndex || null
        };

        
        io.emit('poll:update', pollState);

        
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(() => {
            pollState.timeLeft -= 1;
            io.emit('timer:update', pollState.timeLeft);

            if (pollState.timeLeft <= 0) {
                endPoll(); 
            }
        }, 1000);
    });

    
    socket.on('student:vote', ({ optionId }) => {
        if (pollState.status !== 'VOTING') return;
        if (pollState.votedStudents.includes(socket.id)) return; 

        
        const option = pollState.options.find(opt => opt.id === optionId);
        if (option) {
            option.votes++;
            pollState.votedStudents.push(socket.id);

            
            io.emit('poll:update', pollState);

            
            const activeStudents = Object.values(connectedUsers).filter(u => u.type === 'student');
            if (pollState.votedStudents.length === activeStudents.length) {
                endPoll(); 
            }
        }
    });

    
    socket.on('chat:send', (message) => {
        const user = connectedUsers[socket.id];
        if (user) {
            
            io.emit('chat:receive', {
                text: message,
                sender: user.name,
                senderId: socket.id
            });
        }
    });

    
    socket.on('teacher:kick', (studentSocketId) => {
        
        const requester = connectedUsers[socket.id];
        if (!requester || requester.type !== 'teacher') {
            return; 
        }

        
        if (studentSocketId === socket.id) {
            return;
        }

        
        io.to(studentSocketId).emit('user:kicked');

        
        io.sockets.sockets.get(studentSocketId)?.disconnect(true);

        
        if (connectedUsers[studentSocketId]) {
            delete connectedUsers[studentSocketId];
            io.emit('user:list', Object.values(connectedUsers));
        }
    });

    
    socket.on('teacher:reset_poll', () => {
        
        if (pollState.status === 'RESULTS') {
            
            pollState = {
                question: null,
                options: [],
                status: 'IDLE', 
                timeLeft: 60,
                votedStudents: []
            };
            
            io.emit('poll:update', pollState);
            console.log("Teacher reset poll state to IDLE.");
        }
    });

    
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
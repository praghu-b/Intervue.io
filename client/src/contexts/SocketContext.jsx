import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const socket = io("https://intervue-io-3pu8.onrender.com", {
  transports: ["websocket"],
});


export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [pollState, setPollState] = useState({ 
        question: null, options: [], status: 'IDLE', timeLeft: 60, votedStudents: [], correctAnswerIndex: null 
    });
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [isKicked, setIsKicked] = useState(false);
    const [pollHistory, setPollHistory] = useState([]);

    useEffect(() => {
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Listeners matching server events
        socket.on('poll:update', (state) => setPollState(state));
        socket.on('user:list', (userList) => setUsers(userList));
        socket.on('chat:receive', (msg) => setChatMessages(prev => [...prev, msg]));
        
        socket.on('timer:update', (time) => {
            setPollState(prev => ({ ...prev, timeLeft: time }));
        });

        socket.on('user:kicked', () => {
            setIsKicked(true);
            socket.disconnect(); // Hard disconnect
        });

        socket.on('poll:history', (history) => setPollHistory(history));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('poll:update');
            socket.off('user:list');
            socket.off('chat:receive');
            socket.off('timer:update');
            socket.off('user:kicked');
            socket.off('poll:history');
        };
    }, []);

    const resetPoll = () => {
        if (socket.connected) {
            socket.emit('teacher:reset_poll');
        }
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, pollState, users, chatMessages, isKicked, resetPoll, pollHistory }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
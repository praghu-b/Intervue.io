import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

// ⚠️ Match this to your backend port
const socket = io('http://localhost:5000'); 

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [pollState, setPollState] = useState({ 
        question: null, options: [], status: 'IDLE', timeLeft: 60, votedStudents: [] 
    });
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [isKicked, setIsKicked] = useState(false);

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

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('poll:update');
            socket.off('user:list');
            socket.off('chat:receive');
            socket.off('timer:update');
            socket.off('user:kicked');
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, pollState, users, chatMessages, isKicked }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
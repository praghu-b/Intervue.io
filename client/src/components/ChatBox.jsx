import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Users, X } from 'lucide-react'; // X icon for close

// --- Helper Components (must be defined or imported) ---
const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

const UserMessage = ({ message, isMe }) => (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
        <span className="text-xs font-semibold mb-1.5 text-action">
            {message.sender}
        </span>
        <div 
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm text-white ${
                isMe 
                    ? 'bg-action rounded-br-none' 
                    : 'bg-theme-dark rounded-tl-none'
            }`}
        >
            {message.text}
        </div>
    </div>
);
// --- End Helper Components ---


export default function Sidebar({ onClose, myUserId, isTeacher = false }) {
    const { socket, chatMessages, users } = useSocket();
    const [activeTab, setActiveTab] = useState('Chat'); // 'Chat' or 'Participants'
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'Chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, activeTab]);

    const handleSend = (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (trimmedMessage) {
            socket.emit('chat:send', trimmedMessage);
            setMessage('');
        }
    };

    const handleKickUser = (userId) => {
        if (isTeacher && window.confirm('Are you sure you want to kick this user?')) {
            socket.emit('teacher:kick', userId);
        }
    };

    return (
        // 🔑 Floating Window Style - Matching design
        <div 
            className="absolute w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50"
            style={{ 
                bottom: '80px', // Position above the chat icon
                right: '24px', 
                maxHeight: '400px'
            }}
        >
            {/* Header and Tabs */}
            <div className="flex items-center border-b">
                {/* Tabs */}
                <div className="flex flex-grow">
                    <button
                        onClick={() => setActiveTab('Chat')}
                        className={`px-4 py-3 text-center font-semibold text-sm transition-colors ${
                            activeTab === 'Chat' 
                                ? 'border-b-2 border-action text-theme-dark font-bold' 
                                : 'text-theme-gray'
                        }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('Participants')}
                        className={`px-4 py-3 text-center font-semibold text-sm transition-colors ${
                            activeTab === 'Participants' 
                                ? 'border-b-2 border-action text-theme-dark font-bold' 
                                : 'text-theme-gray'
                        }`}
                    >
                        Participants
                    </button>
                </div>
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="p-2 mr-2 text-theme-gray hover:text-theme-dark transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto bg-white">
                {activeTab === 'Chat' ? (
                    // --- Chat View ---
                    <div className="flex flex-col h-full">
                        <div className="flex-grow overflow-y-auto p-4">
                            {chatMessages.length > 0 ? (
                                <div>
                                    {chatMessages.map((msg, index) => (
                                        <UserMessage key={index} message={msg} isMe={msg.senderId === myUserId} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-theme-gray text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                ) : (
                    // --- Participants View ---
                    <div className="p-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-2 gap-4 pb-3 mb-3 border-b border-theme-light">
                            <div className="text-sm font-medium text-theme-gray">Name</div>
                            <div className="text-sm font-medium text-theme-gray">Action</div>
                        </div>
                        {/* Participants List */}
                        <div>
                            {users.map((user) => (
                                <div key={user.id} className="grid grid-cols-2 gap-4 py-2.5 items-center">
                                    <div className="text-sm font-bold text-theme-dark">
                                        {user.name}
                                    </div>
                                    <div className="text-sm">
                                        {isTeacher && user.type === 'student' ? (
                                            <button
                                                onClick={() => handleKickUser(user.id)}
                                                className="text-action underline hover:text-action-hover transition-colors cursor-pointer"
                                            >
                                                Kick out
                                            </button>
                                        ) : (
                                            <span className="text-theme-gray">-</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input (Only visible for Chat tab) */}
            {activeTab === 'Chat' && (
                <form onSubmit={handleSend} className="p-4 border-t border-theme-light">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full p-2.5 border border-theme-light rounded-md focus:outline-none focus:ring-2 focus:ring-action focus:border-action text-sm"
                        maxLength={100}
                    />
                </form>
            )}
        </div>
    );
}
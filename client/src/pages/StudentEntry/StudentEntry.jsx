import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import IntervuePollLogo from '../../components/IntervuePollLogo';

const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

export default function StudentEntry({ onJoinSuccess }) {
    const { socket, isConnected } = useSocket();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            alert("Please enter your name to join.");
            return;
        }
        
        if (!isConnected) {
            alert("Connection error: Please ensure the server is running.");
            return;
        }

        setLoading(true);

        // 1. Emit the 'user:join' event to the server
        socket.emit('user:join', { name: trimmedName, type: 'student' });

        // 2. Wait for confirmation (or rely on server connection success)
        // Since the server sends an 'poll:update' immediately after 'user:join',
        // we can safely transition to the main view here.
        
        // Use a timeout to simulate network delay before transitioning
        setTimeout(() => {
            setLoading(false);
            // 3. Call the success handler passed from the parent router/component
            onJoinSuccess({ name: trimmedName, type: 'student' });
        }, 500); 
    };

    return (
        <div className="min-h-screen bg-white pt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Intervue Poll Label - Centered at Top */}
                <div className="flex justify-center mb-8">
                    <IntervuePollLogo />
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl text-theme-dark mb-3">
                    Let's <span className="font-bold">Get Started</span>
                </h1>

                {/* Descriptive Paragraph */}
                <p className="text-base text-theme-gray mb-8 leading-relaxed">
                    If you're a student, you'll be able to <strong className="font-semibold text-theme-dark">submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates.
                </p>

                {/* Form */}
                <form onSubmit={handleJoin} className="space-y-6 mx-30">
                    {/* Label */}
                    <label htmlFor="name" className="block text-left text-sm font-medium text-theme-dark mb-2">
                        Enter your Name
                    </label>

                    {/* Input Field */}
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Bajaj"
                        required
                        className="w-full p-4 bg-theme-light border border-theme-light rounded-lg text-lg text-theme-dark focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                        disabled={!isConnected || loading}
                        maxLength={30}
                    />

                    {/* Continue Button */}
                    <button
                        type="submit"
                        disabled={!isConnected || loading}
                        className={`w-full py-4 px-6 rounded-full text-white font-semibold text-lg transition-all 
                            ${isConnected && !loading 
                                ? 'bg-gradient-to-r from-brand to-brand-light hover:opacity-90' 
                                : 'bg-theme-gray cursor-not-allowed opacity-70'
                            }`}
                    >
                        {loading ? 'Joining...' : 'Continue'}
                    </button>
                    
                    {!isConnected && (
                        <p className="text-sm text-theme-error">
                            Server disconnected. Please ensure the backend is running on port 5000.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
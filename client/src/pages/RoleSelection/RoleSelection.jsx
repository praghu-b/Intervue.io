import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleCard from './RoleCard';

export default function RoleSelection() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');

    const handleContinue = () => {
        if (selectedRole === 'teacher') {
            navigate('/create-questions');
        } else {
            navigate('/student-entry');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-brand text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold mb-8 shadow-sm">
                <Sparkles size={16} className="fill-current" />
                <span>Intervue Poll</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-theme-dark text-center mb-3">
                Welcome to the Live Polling System
            </h1>
            <p className="text-theme-gray text-center max-w-xl mb-12 leading-relaxed">
                Please select the role that best describes you to begin using the live polling system
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                <RoleCard
                    role="student"
                    title="I'm a Student"
                    desc="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
                    selected={selectedRole === 'student'}
                    onClick={() => setSelectedRole('student')}
                />
                <RoleCard
                    role="teacher"
                    title="I'm a Teacher"
                    desc="Submit answers and view live poll results in real-time."
                    selected={selectedRole === 'teacher'}
                    onClick={() => setSelectedRole('teacher')}
                />

            </div>

            <button
                onClick={handleContinue}
                className="mt-12 bg-action hover:bg-action-hover text-white font-semibold py-3.5 px-12 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl w-full max-w-xs text-lg"
            >
                Continue
            </button>
        </div>
    );
};
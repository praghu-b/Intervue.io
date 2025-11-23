import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { ArrowLeft } from 'lucide-react';

const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

const PollHistoryItem = ({ poll, index }) => {
    const totalVotes = useMemo(() =>
        poll.options.reduce((sum, opt) => sum + opt.votes, 0),
        [poll.options]
    );

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-theme-dark mb-4">
                Question {index + 1}
            </h3>
            <div className="p-4 rounded-xl shadow-lg bg-theme-light border border-theme-light">
                <div className="p-3 mb-4 rounded-lg bg-theme-dark text-white text-lg font-semibold">
                    {poll.question}
                </div>
                {poll.options.map((option, optIndex) => {
                    const percentage = totalVotes > 0
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;

                    return (
                        <div
                            key={option.id}
                            className="relative flex items-center p-3 my-2 rounded-lg bg-white border border-theme-light transition-all duration-300"
                        >
                            {/* Background Bar for Results */}
                            <div
                                className="absolute inset-0 bg-brand-light rounded-lg opacity-80 transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                            ></div>

                            {/* Content (always on top) */}
                            <div className="relative flex items-center w-full z-10">
                                <FlexCenter className="w-6 h-6 mr-3 rounded-full text-xs font-semibold bg-action text-white">
                                    {optIndex + 1}
                                </FlexCenter>
                                <span className="flex-grow text-base font-medium overflow-hidden whitespace-nowrap text-ellipsis text-theme-dark">
                                    {option.text}
                                </span>

                                {/* Percentage Text */}
                                <span className="ml-4 font-bold text-lg text-theme-dark">
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function PollHistory() {
    const { pollHistory } = useSocket();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans p-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full hover:bg-theme-light transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-theme-dark" />
                    </button>
                    <h1 className="text-4xl font-bold text-theme-dark">
                        View Poll History
                    </h1>
                </div>

                {/* Poll History List */}
                {pollHistory && pollHistory.length > 0 ? (
                    <div>
                        {pollHistory.map((poll, index) => (
                            <PollHistoryItem
                                key={index}
                                poll={poll}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <FlexCenter className="min-h-[400px] text-center text-xl text-theme-gray">
                        <p>No poll history available yet.</p>
                    </FlexCenter>
                )}
            </div>
        </div>
    );
}


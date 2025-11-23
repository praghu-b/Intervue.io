import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { Clock, MessageSquare, Eye, Sparkles, Check } from 'lucide-react';
import Sidebar from '../../components/ChatBox';
import Loader from '../../components/Loader';

const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

const PollOption = ({
    index,
    option,
    isVoted,
    totalVotes,
    status,
    isTeacher = false,
    showResultsImmediately = false,
    isSelected,
    handleSelect,
    isCorrect = false
}) => {
    const { id, text, votes } = option;

    const shouldShowResults = status === 'RESULTS' || showResultsImmediately;

    const percentage = shouldShowResults && totalVotes > 0
        ? Math.round((votes / totalVotes) * 100)
        : 0;

    const isVoting = status === 'VOTING';

    // --- Style Definitions ---
    const baseClasses = "relative flex items-center p-3 m-3 rounded-lg transition-all duration-300";
    const resultClasses = shouldShowResults 
        ? "bg-theme-white border border-theme-border-dark text-black cursor-default"
        : "bg-white border border-theme-light text-theme-dark cursor-default";

    // Styles for Student Voting Phase
    const selectedClasses = "bg-white border-2 border-brand-light text-theme-dark";
    const votedClasses = "bg-white border-2 border-action-hover text-theme-dark cursor-default";
    const defaultVotingClasses = "bg-white hover:border-brand-light border border-theme-light text-theme-dark";
    
    // --- Interaction Logic ---
    const isClickable = isVoting && !isVoted && !isTeacher;
    const pointerClass = isClickable ? 'cursor-pointer' : 'cursor-default';

    // --- Final Class Determination ---
    let currentClasses = baseClasses + ' ' + pointerClass;

    if (status === 'RESULTS' || isTeacher) {
        currentClasses += ' ' + resultClasses;
    } else if (isVoting) {
        if (isVoted) {
            currentClasses += ' ' + votedClasses;
        } else if (isSelected) {
            currentClasses += ' ' + selectedClasses;
        } else {
            currentClasses += ' ' + defaultVotingClasses;
        }
    }

    // Determine number circle styling
    const circleClasses = shouldShowResults
        ? `w-6 h-6 mr-3 rounded-full text-xs font-semibold bg-white text-brand-light`
        : `w-6 h-6 mr-3 rounded-full text-xs font-semibold ${
            (isVoted || isSelected || (isTeacher && shouldShowResults))
                ? 'bg-action text-white'
                : 'bg-theme-gray text-white opacity-80'
        }`;


    return (
        <div
            className={currentClasses}
            onClick={() => isClickable && handleSelect(id)}
        >
            {/* Background Bar for Results */}
            {shouldShowResults && (
                <div
                    className="absolute inset-0 bg-brand-light rounded-lg transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                ></div>
            )}

            {/* Content (always on top) */}
            <div className="relative flex items-center w-full z-10">
                <FlexCenter className={circleClasses}>
                    {index + 1}
                </FlexCenter>
                <span className={`flex-grow text-base font-medium overflow-hidden whitespace-nowrap text-ellipsis text-black`}>
                    {text}
                </span>

                {/* Check mark for correct answer in results */}
                {shouldShowResults && isCorrect && (
                    <Check className="w-5 h-5 text-brand-light mr-2" strokeWidth={3} />
                )}

                {/* Percentage Text */}
                {shouldShowResults && (
                    <span className={`ml-4 font-bold text-lg ${shouldShowResults ? 'text-white' : 'text-theme-dark'}`}>
                        {percentage}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default function PollView({ user, isTeacher = false }) {
    const { socket, pollState, resetPoll } = useSocket();
    const [votedOptionId, setVotedOptionId] = useState(null);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🔑 Sidebar state
    const navigate = useNavigate();

    // Reset vote state when a new poll starts
    useEffect(() => {
        if (pollState.status === 'VOTING') {
            setVotedOptionId(null);
            setSelectedOptionId(null);
        }
    }, [pollState.question]);

    const handleSelectOption = (optionId) => {
        if (pollState.status !== 'VOTING' || isTeacher || votedOptionId) return;
        setSelectedOptionId(optionId);
    };

    const handleSubmitVote = () => {
        // 🔑 FIX: Use explicit null check to allow Option 1 (ID 0) submission
        if (selectedOptionId === null || votedOptionId) return; 

        // Final submission logic:
        setVotedOptionId(selectedOptionId);
        socket.emit('student:vote', { optionId: selectedOptionId });
    };

    const totalVotes = useMemo(() =>
        pollState.options.reduce((sum, opt) => sum + opt.votes, 0),
        [pollState.options]
    );

    const isVoting = pollState.status === 'VOTING';
    const isResults = pollState.status === 'RESULTS';
    const isIdle = pollState.status === 'IDLE';

    // Teacher's display rule: Always show results if the poll is active.
    const showResultsImmediately = isResults || (isTeacher && isVoting);

    // 1. Idle State - Show loader for students waiting
    if (isIdle) {
        return (
            <FlexCenter className="min-h-screen bg-white p-8 relative">
                <div className="text-center">
                    <Loader />
                    <p className="text-xl text-theme-gray">Wait for the teacher to ask questions..</p>
                </div>
                {/* Chat Icon Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-brand to-brand-light hover:opacity-90 text-white shadow-xl flex items-center justify-center z-50 transition-all"
                >
                    <MessageSquare className="w-7 h-7" />
                </button>
                {/* Sidebar/Chat Window */}
                {isSidebarOpen && (
                    <Sidebar 
                        onClose={() => setIsSidebarOpen(false)} 
                        myUserId={socket.id}
                        isTeacher={isTeacher}
                    />
                )}
            </FlexCenter>
        );
    }

    // 2. Voting/Results State
    const questionNumber = '1';

    return (
        <FlexCenter className="min-h-screen bg-white p-8 relative">
            {/* View Poll History Button - Top Right (Teacher only) */}
            {isTeacher && (
                <button
                    onClick={() => navigate('/poll-history')}
                    className="fixed top-6 right-6 flex items-center gap-2 py-2.5 px-4 rounded-full text-white bg-gradient-to-r from-brand to-brand-light hover:opacity-90 transition-all font-semibold text-sm z-50"
                >
                    <Eye className="w-4 h-4" />
                    View Poll history
                </button>
            )}

            <div className="w-full max-w-xl bg-white">
                {/* Question Header with Timer */}
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-theme-dark">Question {questionNumber}</h2>
                    <div className="flex items-center font-semibold">
                        <Clock className="w-5 h-5 mr-1 font-bolder" />
                        <span className='text-theme-error'>00:{pollState.timeLeft < 10 ? `0${pollState.timeLeft}` : pollState.timeLeft}</span>
                    </div>
                </div>

                {/* Poll Card */}
                <div className={`rounded-xl shadow-2xl border ${isResults ? '' : 'bg-theme-light border-theme-light'}`}>
                    <div className={`p-3 rounded-lg text-white text-lg font-semibold ${isResults ? 'bg-theme-dark-gray' : 'bg-theme-dark'}`}>
                        {pollState.question || "Loading Question..."}
                    </div>

                    {pollState.options.map((option, index) => (
                        <PollOption
                            key={option.id}
                            index={index}
                            option={option}
                            isVoted={isResults || votedOptionId === option.id}
                            handleSelect={handleSelectOption}
                            isSelected={selectedOptionId === option.id}
                            totalVotes={totalVotes}
                            status={pollState.status}
                            isTeacher={isTeacher}
                            showResultsImmediately={showResultsImmediately}
                            isCorrect={pollState.correctAnswerIndex === index}
                        />
                    ))}

                    {/* 🔑 Student Submit Button: Visible only if NOT teacher */}
                    {isVoting && !votedOptionId && !isTeacher && (
                        <FlexCenter className="mt-6">
                            <button
                                onClick={handleSubmitVote}
                                disabled={selectedOptionId === null}
                                className={`py-3 px-8 rounded-full text-white font-semibold text-lg transition-all ${selectedOptionId === null
                                    ? 'bg-theme-gray cursor-not-allowed opacity-70'
                                    : 'bg-gradient-to-r from-brand to-brand-light hover:opacity-90'
                                    }`}
                            >
                                Submit
                            </button>
                        </FlexCenter>
                    )}

                    {/* 🔑 Teacher Action Buttons Section */}
                    {isTeacher && isResults && (
                        <FlexCenter className="mt-6">
                            <button
                                onClick={resetPoll}
                                className="py-3 px-8 rounded-full text-white font-semibold text-lg bg-gradient-to-r from-brand to-brand-light hover:opacity-90 transition-all"
                            >
                                + Ask a new question
                            </button>
                        </FlexCenter>
                    )}

                    {isVoting && votedOptionId && (
                        <p className="mt-6 text-center text-theme-gray">
                            Thank you! Waiting for the poll to end...
                        </p>
                    )}

                    {isResults && !isTeacher && (
                        <p className="mt-6 text-center text-lg font-semibold text-theme-dark">
                            Wait for the teacher to ask a new question...
                        </p>
                    )}

                </div>
            </div>

            {/* Chat Icon Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-brand to-brand-light hover:opacity-90 text-white shadow-xl flex items-center justify-center z-50 transition-all"
            >
                <MessageSquare className="w-7 h-7" />
            </button>

            {/* 🔑 Sidebar/Chat Window */}
            {isSidebarOpen && (
                <Sidebar 
                    onClose={() => setIsSidebarOpen(false)} 
                    myUserId={socket.id}
                    isTeacher={isTeacher}
                />
            )}
        </FlexCenter>
    );
}
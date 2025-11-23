import { useState, useMemo } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import TimeDropdown from './TimeDropdown';
import AnswerOption from './AnswerOption';
import { useSocket } from '../../contexts/SocketContext';
import IntervuePollLogo from '../../components/IntervuePollLogo';

const FlexBetween = ({ children, className = '' }) => (
    <div className={`flex items-center justify-between ${className}`}>{children}</div>
);

export default function QuestionCreation() {

    const { socket } = useSocket();

    const [question, setQuestion] = useState('Enter your question here...');
    const [timeLimit, setTimeLimit] = useState(60);
    const [options, setOptions] = useState([
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: false },
    ]);

    const charLimit = 100;

    const handleAddOption = () => {
        setOptions([...options, { text: '', isCorrect: false }]);
    };

    const handleOptionChange = (index, newText) => {
        const newOptions = [...options];
        newOptions[index].text = newText;
        setOptions(newOptions);
    };

    const handleCorrectChange = (index, isCorrect) => {
        // Ensure only one option can be marked as correct (standard MCQ)
        const newOptions = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index ? isCorrect : false,
        }));
        setOptions(newOptions);
    };

    const handleAskQuestion = () => {
        console.log('Question:', question);
        console.log('Time Limit:', timeLimit);
        console.log('Options:', options);

        // Socket Emission: Now using the socket from context
        if (socket) {
            const correctAnswerIndex = options.findIndex(opt => opt.isCorrect);
            socket.emit('teacher:ask', {
                question: question.trim(),
                options: options.map(opt => opt.text.trim()),
                timeLimit: timeLimit,
                correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : null
            });
            console.log(`Poll emitted: ${question}`);
        } else {
            alert("Connection error: Socket not available.");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-theme-dark pt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="mb-4">
                        <IntervuePollLogo size="small" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3">
                        Let's Get Started
                    </h1>
                    <p className="text-theme-gray text-base">
                        you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                    </p>
                </div>

                <section className="mb-10">
                    <FlexBetween className="mb-3">
                        <h2 className="text-lg font-semibold text-theme-dark">Enter your question</h2>
                        <TimeDropdown value={timeLimit} onChange={setTimeLimit} />
                    </FlexBetween>

                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value.slice(0, charLimit))}
                            rows={4}
                            className="w-full p-4 text-xl rounded-lg border-2 border-theme-light focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none placeholder-theme-gray"
                            placeholder="Enter your question here..."
                        />
                        <div className="absolute bottom-2 right-4 text-sm text-theme-gray">
                            {question.length}/{charLimit}
                        </div>
                    </div>
                </section>

                <section>
                    <FlexBetween className="mb-2">
                        <h2 className="text-lg font-semibold text-theme-dark">Edit Options</h2>
                        <h2 className="text-lg font-semibold text-theme-dark mr-10">Is it Correct?</h2>
                    </FlexBetween>

                    {options.map((option, index) => (
                        <AnswerOption
                            key={index}
                            index={index}
                            value={option.text}
                            onChange={(text) => handleOptionChange(index, text)}
                            isCorrect={option.isCorrect}
                            onCorrectChange={(isCorrect) => handleCorrectChange(index, isCorrect)}
                        />
                    ))}

                    {options.length < 4 && <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-6 flex items-center text-action font-medium hover:text-action-hover transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-1" />
                        + Add More option
                    </button>}
                </section>

                <div className="mt-16 border-t border-theme-light"></div>
            </div>

            <div className="sticky bottom-0 bg-white shadow-lg py-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
                    <button
                        type="submit"
                        onClick={handleAskQuestion}
                        className="py-3 px-8 rounded-full text-white font-semibold text-lg bg-gradient-to-r from-brand to-brand-light hover:opacity-90 transition-all focus:outline-none focus:ring-4 focus:ring-brand-light focus:ring-opacity-50"
                    >
                        Ask Question
                    </button>
                </div>
            </div>
        </div>
    );
}
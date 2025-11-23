const FlexBetween = ({ children, className = '' }) => (
    <div className={`flex items-center justify-between ${className}`}>{children}</div>
);
const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

export default function AnswerOption({ index, value, onChange, isCorrect, onCorrectChange }) {
    const correctName = `isCorrectGroup-${index}`;

    return (
        <FlexBetween className="mt-4">
            <div className="flex items-center w-full max-w-lg">
                <FlexCenter className="w-8 h-8 rounded-full bg-brand text-white text-xs font-semibold mr-4">
                    {index + 1}
                </FlexCenter>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-grow p-3 bg-theme-light rounded-md border border-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none text-base text-theme-dark placeholder-theme-gray"
                />
            </div>

            <div className="flex items-center ml-8 min-w-[200px]">
                <label className="flex items-center cursor-pointer mr-6">
                    <input
                        type="radio"
                        name={correctName}
                        checked={isCorrect}
                        onChange={() => onCorrectChange(true)}
                        className="form-radio h-4 w-4 text-brand ring-brand focus:ring-brand"
                    />
                    <span className="ml-2 font-bold">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name={correctName}
                        checked={!isCorrect}
                        onChange={() => onCorrectChange(false)}
                        className="form-radio h-4 w-4 text-brand ring-brand focus:ring-brand"
                    />
                    <span className="ml-2 font-bold">No</span>
                </label>
            </div>
        </FlexBetween>
    );
};
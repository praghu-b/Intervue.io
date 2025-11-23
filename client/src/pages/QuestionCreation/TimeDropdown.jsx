import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TimeDropdown({ value, onChange }) {
    const timeOptions = [30, 45, 60];
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left z-10">
            <button
                type="button"
                className="inline-flex justify-center items-center w-full rounded-md px-4 py-2 text-sm font-medium text-theme-dark bg-white focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value} seconds
                <ChevronDown className="-mr-1 ml-2 h-5 w-5 text-brand" aria-hidden="true" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                className="block w-full text-left px-4 py-2 text-sm text-theme-dark hover:bg-theme-light"
                                onClick={() => {
                                    onChange(time);
                                    setIsOpen(false);
                                }}
                            >
                                {time} seconds
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
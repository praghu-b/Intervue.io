import React from 'react';
import IntervuePollLogo from './IntervuePollLogo';

const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

export default function Loader() {
    return (
        <FlexCenter className="flex-col">
            {/* Intervue Poll Label */}
            <div className="flex items-center justify-center mb-8">
                <IntervuePollLogo size="large" />
            </div>

            {/* C-shaped Loader */}
            <div className="relative w-24 h-24 mb-8">
                <svg
                    className="animate-spin"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset="62.8"
                        className="text-brand"
                    />
                </svg>
            </div>
        </FlexCenter>
    );
}


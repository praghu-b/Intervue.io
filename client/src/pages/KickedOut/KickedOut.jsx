import React from 'react';
import IntervuePollLogo from '../../components/IntervuePollLogo';

const FlexCenter = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

export default function KickedOut() {
    return (
        <FlexCenter className="min-h-screen bg-white p-8">
            <div className="text-center">
                {/* Header with Star Icon and Label */}
                <div className="flex items-center justify-center mb-8">
                    <IntervuePollLogo size="large" />
                </div>

                {/* Main Message */}
                <h1 className="text-5xl font-bold text-theme-dark mb-6">
                    You've been Kicked out!
                </h1>

                {/* Explanatory Message */}
                <p className="text-lg text-theme-dark max-w-md mx-auto">
                    Looks like the teacher had removed you from the poll system. Please Try again sometime.
                </p>
            </div>
        </FlexCenter>
    );
}


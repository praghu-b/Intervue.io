import React from 'react';
import { Sparkles } from 'lucide-react';

export default function IntervuePollLogo({ className = '', size = 'default' }) {
    // Size variants
    const sizeClasses = {
        small: 'px-3 py-1 text-xs',
        default: 'px-3 py-1.5 text-xs',
        large: 'px-4 py-2 text-sm'
    };

    const iconSizes = {
        small: 'w-3 h-3',
        default: 'w-4 h-4',
        large: 'w-5 h-5'
    };

    return (
        <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full text-white font-semibold bg-gradient-to-r from-brand to-brand-light ${className}`}>
            <Sparkles className={`${iconSizes[size]} text-white mr-2 fill-white`} />
            Intervue Poll
        </div>
    );
}


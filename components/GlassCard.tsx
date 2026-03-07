"use client";

import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export default function GlassCard({
    children,
    className = "",
    hoverEffect = true,
    onClick
}: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                relative
                bg-white/5 
                backdrop-blur-md
                border border-white/10 
                rounded-3xl
                overflow-hidden
                transition-all duration-500
                ${hoverEffect ? "hover:bg-white/10 hover:border-antique-gold/30 hover:shadow-lg hover:shadow-antique-gold/10" : ""}
                ${onClick ? "cursor-pointer" : ""}
                ${className}
            `}
        >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

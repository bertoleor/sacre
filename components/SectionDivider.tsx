"use client";

interface SectionDividerProps {
    variant?: "top" | "bottom" | "both";
    height?: string;
}

export default function SectionDivider({ 
    variant = "both", 
    height = "h-32" 
}: SectionDividerProps) {
    return (
        <div className={`relative w-full ${height} overflow-hidden pointer-events-none`}>
            {/* Top gradient - fades into section */}
            {(variant === "top" || variant === "both") && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent" />
            )}
            
            {/* Bottom gradient - fades out of section */}
            {(variant === "bottom" || variant === "both") && (
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            )}
            
            {/* Subtle line for visual separation (optional) */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
}

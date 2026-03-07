"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithBlurProps extends ImageProps {
    blurDataURL?: string;
}

export default function ImageWithBlur({
    src,
    alt,
    blurDataURL,
    className,
    ...props
}: ImageWithBlurProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Generate a simple blurred placeholder if none provided
    const placeholder = blurDataURL || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+";

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder */}
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                    isLoaded ? "opacity-0" : "opacity-100"
                }`}
                style={{
                    backgroundImage: `url(${placeholder})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(20px)",
                    transform: "scale(1.1)",
                }}
            />
            
            {/* Main Image */}
            <Image
                src={src}
                alt={alt}
                className={`transition-all duration-700 ${
                    isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
}

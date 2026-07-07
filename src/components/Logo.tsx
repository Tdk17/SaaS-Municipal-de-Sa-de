/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = '', showText = true, textColor = 'text-blue-900', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* SVG Emblem mimicking the Prefeitura Municipal uploaded logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        className={iconOnly ? "w-12 h-12" : "w-16 h-16 sm:w-20 sm:h-20"}
      >
        {/* Yellow Sun/Arc over the buildings */}
        <path
          d="M 120,180 A 100,100 0 0,1 280,180"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Skyscraper Building blocks in shades of blue */}
        {/* Building 1 (Left, Medium Blue) */}
        <path d="M 160,180 L 175,150 L 175,195 L 160,210 Z" fill="#0284c7" />
        {/* Building 2 (Center, Dark Blue, Tallest) */}
        <path d="M 180,180 L 195,120 L 210,120 L 210,195 L 180,195 Z" fill="#1e3a8a" />
        {/* Building 3 (Right Center, Sky Blue) */}
        <path d="M 215,195 L 215,135 L 230,135 L 230,195 Z" fill="#38bdf8" />
        {/* Building 4 (Right, Tealish Blue) */}
        <path d="M 235,195 L 235,160 L 250,175 L 250,195 Z" fill="#0369a1" />

        {/* Leafy circular landscape bottom */}
        {/* Left Leaf (Green) */}
        <path
          d="M 110,230 C 110,230 160,290 200,285 C 190,270 170,250 110,230 Z"
          fill="#4ade80"
        />
        {/* Right Leaf (Deep Blue) */}
        <path
          d="M 290,230 C 290,230 240,290 200,285 C 210,270 230,250 290,230 Z"
          fill="#1d4ed8"
        />
        {/* Middle curved white road */}
        <path
          d="M 190,285 C 195,275 200,240 205,285"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Three Human Silhouettes underneath the buildings with hands up */}
        {/* Left Person (Blue) */}
        <circle cx="160" cy="215" r="10" fill="#0284c7" />
        <path
          d="M 140,230 C 145,220 155,225 160,228 C 165,225 175,220 180,230 C 170,235 150,235 140,230 Z"
          fill="#0284c7"
        />

        {/* Center Person (Yellow/Orange) */}
        <circle cx="200" cy="225" r="10" fill="#eab308" />
        <path
          d="M 175,240 C 185,230 195,235 200,238 C 205,235 215,230 225,240 C 215,245 185,245 175,240 Z"
          fill="#eab308"
        />

        {/* Right Person (Green) */}
        <circle cx="240" cy="215" r="10" fill="#22c55e" />
        <path
          d="M 220,230 C 225,220 235,225 240,228 C 245,225 255,220 260,230 C 250,235 230,235 220,230 Z"
          fill="#22c55e"
        />
      </svg>

      {/* Texts "Prefeitura Municipal" below the emblem */}
      {!iconOnly && showText && (
        <div className="text-center mt-2 flex flex-col items-center">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${textColor}`}>
            Prefeitura Municipal
          </span>
            
               </div>
      )}
    </div>
  );
}

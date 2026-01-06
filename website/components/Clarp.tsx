'use client';

interface ClarpProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * CLARP - The official $CLARP mascot
 * An inverted design - terracotta background with black void cutout
 * Represents emptiness, vaporware, and the shape of promises
 * Centered and maximized within the viewBox
 */
export default function Clarp({ size = 64, className = '', animate = false }: ClarpProps) {
  return (
    <div
      className={`inline-block ${animate ? 'animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Terracotta background - the substance */}
        <rect width="256" height="256" fill="#D97757"/>

        {/* CLARP mascot - centered and maximized
            Total width: 192 (body 160 + ears 16 each side)
            Total height: 160 (body 96 + legs 64)
            Centered: x offset = (256-192)/2 = 32, y offset = (256-160)/2 = 48
        */}

        {/* Left ear void */}
        <rect x="32" y="68" width="16" height="24" fill="#0a0a09"/>

        {/* Body void - main rectangle */}
        <rect x="48" y="48" width="160" height="96" fill="#0a0a09"/>

        {/* Right ear void */}
        <rect x="208" y="68" width="16" height="24" fill="#0a0a09"/>

        {/* Left eye - terracotta showing through (proportionate to original) */}
        <rect x="80" y="76" width="24" height="40" fill="#D97757"/>

        {/* Right eye - terracotta showing through (proportionate to original) */}
        <rect x="152" y="76" width="24" height="40" fill="#D97757"/>

        {/* Left leg void */}
        <rect x="56" y="144" width="32" height="64" fill="#0a0a09"/>

        {/* Middle-left leg void */}
        <rect x="104" y="144" width="24" height="64" fill="#0a0a09"/>

        {/* Middle-right leg void */}
        <rect x="128" y="144" width="24" height="64" fill="#0a0a09"/>

        {/* Right leg void */}
        <rect x="168" y="144" width="32" height="64" fill="#0a0a09"/>
      </svg>
    </div>
  );
}

/**
 * CLARP with glitch effect for more dramatic appearances
 */
export function ClarpGlitch({ size = 64, className = '' }: Omit<ClarpProps, 'animate'>) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Glitch layers */}
      <div className="absolute inset-0 opacity-50" style={{ transform: 'translate(-2px, 0)', filter: 'hue-rotate(90deg)' }}>
        <Clarp size={size} />
      </div>
      <div className="absolute inset-0 opacity-50" style={{ transform: 'translate(2px, 0)', filter: 'hue-rotate(-90deg)' }}>
        <Clarp size={size} />
      </div>
      <div className="relative">
        <Clarp size={size} />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';
import SeamlessVideo from './SeamlessVideo';

export default function BrandLogo({
  size = 'md',
  variant = 'terminal',
  className = '',
  onClick = null
}) {
  const [videoError, setVideoError] = useState(false);

  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-3xl',
    banner: 'w-36 sm:w-44 md:w-52 h-9 sm:h-11 md:h-12',
    auth: 'w-full h-28 sm:h-32'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (!videoError) {
    // Main page top navbar banner: beveled pill widget that fits seamlessly
    if (size === 'banner') {
      return (
        <div
          onClick={onClick}
          className={`relative flex items-center justify-center rounded-xl border border-slate-800/80 bg-slate-950/60 shadow-sm overflow-hidden p-0.5 ${currentSize} ${onClick ? 'cursor-pointer' : ''} ${className}`}
          title="OmniFlow"
        >
          <SeamlessVideo
            src="/logo.mp4"
            fadeDuration={0.8}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center rounded-lg"
            containerClassName="relative w-full h-full overflow-hidden rounded-lg"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>
      );
    }

    // Login screen card logo: beveled card with rounded-2xl corners matching the input fields
    if (size === 'auth') {
      return (
        <div
          className={`relative flex items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/70 shadow-inner overflow-hidden p-1 ${currentSize} ${className}`}
        >
          <SeamlessVideo
            src="/logo.mp4"
            fadeDuration={0.8}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center rounded-xl"
            containerClassName="relative w-full h-full overflow-hidden rounded-xl"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>
      );
    }

    // Default square icon logos (sm, md, lg, xl)
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md border border-blue-500/30 bg-slate-950 ${currentSize} ${className}`}
      >
        <SeamlessVideo
          src="/logo.mp4"
          fadeDuration={0.8}
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover object-center rounded-lg"
          containerClassName="relative w-full h-full overflow-hidden rounded-lg"
        />
      </div>
    );
  }

  // Graceful fallback to modern SVG gradient icon if video is absent or errors
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center shrink-0 rounded-2xl shadow-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white border border-blue-400/30 ${currentSize} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {variant === 'shield' ? (
        <ShieldCheck className={size === 'lg' || size === 'xl' || size === 'auth' || size === 'banner' ? 'w-8 h-8' : 'w-5 h-5'} />
      ) : (
        <Terminal className={size === 'lg' || size === 'xl' || size === 'auth' || size === 'banner' ? 'w-8 h-8' : 'w-5 h-5'} />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

/**
 * SeamlessVideo
 * Provides a stutter-free, jumping-free, continuous seamless dissolve loop
 * for background videos and animated logos.
 * Uses a dual-player crossfade technique so the ending video smoothly melts
 * into the beginning of the next cycle.
 */
export default function SeamlessVideo({
  src,
  className = 'w-full h-full object-cover object-center',
  containerClassName = 'relative w-full h-full overflow-hidden',
  fadeDuration = null, // in seconds, null for auto-calculation
  onError = () => {},
  style = {}
}) {
  const [activePlayer, setActivePlayer] = useState(0); // 0 or 1
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const isCrossfadingRef = useRef(false);

  // Initialize and reset when src changes
  useEffect(() => {
    setActivePlayer(0);
    isCrossfadingRef.current = false;

    const vA = videoARef.current;
    const vB = videoBRef.current;

    if (vA) {
      vA.defaultMuted = true;
      vA.muted = true;
      vA.currentTime = 0;
      vA.play().catch(() => {});
    }
    if (vB) {
      vB.defaultMuted = true;
      vB.muted = true;
      vB.pause();
      vB.currentTime = 0;
    }
  }, [src]);

  const handleTimeUpdate = (playerIndex) => {
    if (playerIndex !== activePlayer) return;

    const currentEl = playerIndex === 0 ? videoARef.current : videoBRef.current;
    const nextEl = playerIndex === 0 ? videoBRef.current : videoARef.current;

    if (!currentEl || !nextEl || !currentEl.duration) return;

    // Calculate crossfade duration:
    // If explicitly passed, use that; otherwise 1.2s for long videos, or 20% for short videos (min 0.5s)
    const effectiveFadeDuration = fadeDuration !== null
      ? fadeDuration
      : Math.min(1.2, Math.max(0.5, currentEl.duration * 0.2));

    const timeLeft = currentEl.duration - currentEl.currentTime;

    // Trigger crossfade when nearing the end
    if (timeLeft <= effectiveFadeDuration && !isCrossfadingRef.current) {
      isCrossfadingRef.current = true;
      nextEl.defaultMuted = true;
      nextEl.muted = true;
      nextEl.currentTime = 0;
      nextEl.play().then(() => {
        setActivePlayer(playerIndex === 0 ? 1 : 0);
      }).catch(() => {
        setActivePlayer(playerIndex === 0 ? 1 : 0);
      });
    }

    // Reset lock once the new video has played past the transition window
    if (timeLeft > effectiveFadeDuration + 0.5) {
      isCrossfadingRef.current = false;
    }
  };

  const handleVideoEnded = (playerIndex) => {
    // Safety net in case timeupdate was delayed by the browser
    if (playerIndex === activePlayer) {
      const nextEl = playerIndex === 0 ? videoBRef.current : videoARef.current;
      if (nextEl) {
        nextEl.defaultMuted = true;
        nextEl.muted = true;
        nextEl.currentTime = 0;
        nextEl.play().catch(() => {});
      }
      setActivePlayer(playerIndex === 0 ? 1 : 0);
      isCrossfadingRef.current = false;
    }
    // Pause the finished video to save GPU/CPU cycles until it is needed again
    const finishedEl = playerIndex === 0 ? videoARef.current : videoBRef.current;
    if (finishedEl) {
      finishedEl.pause();
    }
  };

  const effectiveTransition = fadeDuration !== null ? `${fadeDuration}s` : '1.2s';

  return (
    <div className={containerClassName} style={style}>
      {/* Video Player A */}
      <video
        ref={videoARef}
        src={src}
        autoPlay
        muted
        playsInline
        onTimeUpdate={() => handleTimeUpdate(0)}
        onEnded={() => handleVideoEnded(0)}
        onError={onError}
        className={`absolute inset-0 ${className} pointer-events-none`}
        style={{
          opacity: activePlayer === 0 ? 1 : 0,
          transition: `opacity ${effectiveTransition} ease-in-out`,
          zIndex: activePlayer === 0 ? 2 : 1
        }}
      />

      {/* Video Player B */}
      <video
        ref={videoBRef}
        src={src}
        muted
        playsInline
        onTimeUpdate={() => handleTimeUpdate(1)}
        onEnded={() => handleVideoEnded(1)}
        onError={onError}
        className={`absolute inset-0 ${className} pointer-events-none`}
        style={{
          opacity: activePlayer === 1 ? 1 : 0,
          transition: `opacity ${effectiveTransition} ease-in-out`,
          zIndex: activePlayer === 1 ? 2 : 1
        }}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

// Curated realistic agriculture photos — continuously cycling, never repeats until full cycle
const FARM_PHOTOS = [
  'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2804327/pexels-photo-2804327.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2131967/pexels-photo-2131967.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2880507/pexels-photo-2880507.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/259280/pexels-photo-259280.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/1084542/pexels-photo-1084542.jpeg?auto=compress&w=1920',
  'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&w=1920',
];

const INTERVAL = 8000;

export default function RealisticBackground() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const nextRef = useRef(1);

  // Preload next 2 images
  useEffect(() => {
    [1, 2].forEach(offset => {
      const img = new Image();
      img.src = FARM_PHOTOS[(idx + offset) % FARM_PHOTOS.length];
    });
  }, [idx]);

  // Auto-cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % FARM_PHOTOS.length);
        setFade(false);
      }, 1500);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const cur = FARM_PHOTOS[idx];
  const nxt = FARM_PHOTOS[(idx + 1) % FARM_PHOTOS.length];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'rgba(11,61,26,0.8)',
    }}>
      {/* Current image */}
      <img
        key={'cur-' + idx}
        src={cur}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: fade ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out, transform 10s ease',
          transform: fade ? 'scale(1.08)' : 'scale(1.02)',
        }}
      />
      {/* Next image (fades in) */}
      <img
        key={'nxt-' + ((idx + 1) % FARM_PHOTOS.length)}
        src={nxt}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: fade ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          transform: 'scale(1)',
        }}
      />
      {/* Dark overlay for readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: `linear-gradient(
          180deg,
          rgba(5, 12, 5, 0.65) 0%,
          rgba(5, 12, 5, 0.45) 25%,
          rgba(5, 12, 5, 0.50) 50%,
          rgba(5, 12, 5, 0.60) 75%,
          rgba(5, 12, 5, 0.80) 100%
        )`,
      }} />
      {/* Side gradient for sidebar area */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        zIndex: 3,
        background: 'linear-gradient(90deg, rgba(5,10,5,0.7) 0%, transparent 100%)',
      }} />
      {/* Subtle vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
      }} />
    </div>
  );
}

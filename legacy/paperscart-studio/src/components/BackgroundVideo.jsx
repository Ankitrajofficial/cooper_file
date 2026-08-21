import React, { useEffect, useRef } from 'react';

// Autoplaying, muted, looping background video.
// React's `muted` JSX prop is famously unreliable at setting the DOM `muted`
// property, so Safari/iOS treat the video as unmuted and BLOCK autoplay (it then
// shows a play button). We force `muted` on the element and call play() directly,
// retrying on `canplay` for browsers that aren't ready on mount.
export default function BackgroundVideo({ src, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;

    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener('canplay', tryPlay, { once: true });
    return () => video.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

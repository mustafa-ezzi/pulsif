import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../motion/register";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const SRC = "/gymshark.mp4";

export function VideoHero() {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const reduce = useReducedMotion();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(!reduce);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = muted;
    if (reduce) {
      video.pause();
      setPlaying(false);
      return undefined;
    }

    const node = rootRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting && playing) {
          videoRef.current.play().catch(() => setPlaying(false));
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.2 }
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [muted, playing, reduce]);

  useGSAP(
    () => {
      if (reduce) {
        gsap.set(".video-hero__line", { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from(".video-hero__line", {
        y: 28,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.8,
        delay: 0.15,
      });
    },
    { scope: rootRef, dependencies: [reduce] }
  );

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
  };

  return (
    <section ref={rootRef} className="video-hero" aria-label="New in">
      <video
        ref={videoRef}
        className="video-hero__media"
        src={SRC}
        autoPlay={!reduce}
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="video-hero__scrim" />
      <div className="video-hero__copy">
        <h1 className="video-hero__title video-hero__line">New in: the studio floor</h1>
        <p className="video-hero__lede video-hero__line">
          Boards, bands, and grips you will want for the session — and the hours around it.
        </p>
        <div className="video-hero__actions video-hero__line">
          <Link className="video-hero__btn" to="/catalog">
            Shop the collection
          </Link>
          <Link className="video-hero__btn video-hero__btn--ghost" to="/catalog/women">
            Shop women
          </Link>
        </div>
      </div>
      <div className="video-hero__controls">
        <button type="button" className="video-hero__ctrl" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={18} strokeWidth={1.6} /> : <Volume2 size={18} strokeWidth={1.6} />}
        </button>
        <button type="button" className="video-hero__ctrl" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} />}
        </button>
      </div>
    </section>
  );
}

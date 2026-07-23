"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  lessonId: string;
  initialTime?: number;
  onProgressUpdate: (lessonId: string, currentTime: number, percentage: number) => void;
}

export default function VideoPlayer({ src, lessonId, initialTime = 0, onProgressUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const lastUpdatedTime = useRef<number>(0);

  // Auto-resume from initialTime once metadata loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialTime > 0 && !hasResumed) {
        // Safe seek
        video.currentTime = Math.min(initialTime, video.duration - 2);
        setHasResumed(true);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    // In case metadata is already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [initialTime, hasResumed, src]);

  // Periodic progress saving (every 5 seconds of watch time)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      const timeDiff = Math.abs(video.currentTime - lastUpdatedTime.current);
      if (timeDiff >= 5 && video.duration > 0) {
        const percentage = (video.currentTime / video.duration) * 100;
        onProgressUpdate(lessonId, video.currentTime, percentage);
        lastUpdatedTime.current = video.currentTime;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [lessonId, onProgressUpdate]);

  // Save progress on pause or ended
  const handleSaveImmediately = () => {
    const video = videoRef.current;
    if (video && video.duration > 0) {
      const percentage = (video.currentTime / video.duration) * 100;
      onProgressUpdate(lessonId, video.currentTime, percentage);
      lastUpdatedTime.current = video.currentTime;
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      handleSaveImmediately();
    } else {
      video.play().catch(err => console.error("Play error:", err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = Number(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden shadow-2xl border border-border aspect-video flex flex-col justify-end">
      <video
        ref={videoRef}
        src={src}
        onClick={togglePlay}
        onPause={() => {
          setIsPlaying(false);
          handleSaveImmediately();
        }}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => {
          setIsPlaying(false);
          handleSaveImmediately();
        }}
        className="w-full h-full object-contain cursor-pointer"
        preload="metadata"
      />

      {/* Custom overlay/controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Seekbar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white font-medium">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-primary h-1 bg-white/20 rounded-lg cursor-pointer range-sm"
          />
          <span className="text-[10px] font-mono text-white font-medium">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                }
              }}
              className="text-white hover:text-primary transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>

          <button
            onClick={handleFullscreen}
            className="text-white hover:text-primary transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

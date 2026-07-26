"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  lessonId: string;
  initialTime?: number;
  onProgressUpdate: (lessonId: string, currentTime: number, percentage: number) => void;
}

export default function VideoPlayer({ src, lessonId, initialTime = 0, onProgressUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const lastUpdatedTime = useRef<number>(0);
  
  // HLS Quality State
  const hlsRef = useRef<Hls | null>(null);
  const [hlsLevels, setHlsLevels] = useState<{height: number, name: string, index: number}[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 means Auto
  const [showSettings, setShowSettings] = useState(false);

  // Setup HLS.js for .m3u8 playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30, // Limit buffer to avoid downloading the whole video
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;

      // Add a cache buster to force fetching the newest manifest (bypasses old CDN caches)
      const cacheBustedSrc = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}?t=${Date.now()}`;
      hls.loadSource(cacheBustedSrc);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Extract available quality levels
        const levels = data.levels.map((l, index) => ({ 
          height: l.height, 
          name: l.name || `${l.height}p`,
          index 
        }));
        setHlsLevels(levels.reverse()); // Put highest quality at the top

        // Safe seek after manifest is parsed
        if (initialTime > 0 && !hasResumed) {
          video.currentTime = Math.min(initialTime, video.duration || 9999);
          setHasResumed(true);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which natively supports HLS
      video.src = src;
      const handleLoadedMetadata = () => {
        if (initialTime > 0 && !hasResumed) {
          video.currentTime = Math.min(initialTime, video.duration || 9999);
          setHasResumed(true);
        }
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    } else {
      // Fallback for regular MP4 files
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, initialTime, hasResumed]);

  // Track duration when it becomes available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDurationChange = () => setDuration(video.duration);
    video.addEventListener("durationchange", handleDurationChange);
    
    return () => video.removeEventListener("durationchange", handleDurationChange);
  }, []);

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
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    } else if (container.requestFullscreen) {
      container.requestFullscreen().catch(err => console.error(err));
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
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    
    const minStr = minutes < 10 && hours > 0 ? `0${minutes}` : minutes;
    const secStr = seconds < 10 ? `0${seconds}` : seconds;

    if (hours > 0) {
      return `${hours}:${minStr}:${secStr}`;
    }
    return `${minutes}:${secStr}`;
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowSettings(false);
    }
  };

  return (
    <div ref={containerRef} className="relative group bg-black rounded-xl overflow-hidden shadow-2xl border border-border aspect-video flex flex-col justify-end w-full h-full max-h-screen">
      <video
        ref={videoRef}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
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

          <div className="flex items-center gap-4 relative">
            {/* Quality Settings */}
            {hlsLevels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-white hover:text-primary transition-colors cursor-pointer ${showSettings ? 'text-primary' : ''}`}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-black/90 border border-white/10 rounded-lg overflow-hidden flex flex-col backdrop-blur-md text-xs z-50">
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`px-4 py-2 text-left hover:bg-white/10 transition-colors ${currentLevel === -1 ? 'text-primary font-bold bg-white/5' : 'text-white'}`}
                    >
                      Auto
                    </button>
                    {hlsLevels.map((level) => (
                      <button
                        key={level.index}
                        onClick={() => handleQualityChange(level.index)}
                        className={`px-4 py-2 text-left hover:bg-white/10 transition-colors ${currentLevel === level.index ? 'text-primary font-bold bg-white/5' : 'text-white'}`}
                      >
                        {level.name !== "undefinedp" ? level.name : `${level.height}p`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
    </div>
  );
}

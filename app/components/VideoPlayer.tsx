import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomVideoPlayerProps {
  videoSrc: string;
  poster?: string;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onLoaded?: () => void;
}

export function VideoPlayer({
  videoSrc,
  poster,
  onError,
  onLoaded,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle progress bar click for seeking
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!videoRef.current) return;

    switch (e.key) {
      case " ":
        togglePlay();
        e.preventDefault();
        break;
      case "ArrowRight":
        videoRef.current.currentTime += 10;
        e.preventDefault();
        break;
      case "ArrowLeft":
        videoRef.current.currentTime -= 10;
        e.preventDefault();
        break;
      case "f":
        toggleFullscreen();
        e.preventDefault();
        break;
      case "m":
        toggleMute();
        e.preventDefault();
        break;
    }
  };

  // Update buffered progress
  const updateBufferProgress = () => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const duration = video.duration;
    setBuffered((bufferedEnd / duration) * 100);
  };

  // Auto-hide controls after inactivity
  const resetControlsTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowControls(true);

    timeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  // Handler for when loadeddata event fires
  const handleVideoLoaded = () => {
    if (onLoaded) {
      onLoaded();
    }
  };

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBufferProgress();
    };

    const onDurationChange = () => {
      setDuration(video.duration);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onProgress = () => {
      updateBufferProgress();
    };

    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const onLoadedData = () => {
      handleVideoLoaded();
    };

    // Fullscreen change detection
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Add listeners
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("progress", onProgress);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("loadeddata", onLoadedData);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    // Remove listeners on cleanup
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("loadeddata", onLoadedData);

      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onLoaded]);

  // Handle controls visibility
  useEffect(() => {
    resetControlsTimeout();
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden bg-background w-full max-w-4xl mx-auto group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        className="w-full h-full"
        onError={onError}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />
      {/* Big play button overlay (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-muted/40 text-primary-foreground rounded-full p-4 transition-transform hover:scale-110">
            <Play size={48} />
          </div>
        </div>
      )}
      {/* Controls bar */}{" "}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-muted/90 to-transparent px-4 py-2 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}{" "}
        <div
          ref={progressBarRef}
          className="relative h-1.5 mb-3 mt-1 bg-accent rounded cursor-pointer hover:h-2.5 transition-all"
          onClick={handleProgressBarClick}
        >
          {/* Buffered progress */}
          <div
            className="absolute h-full bg-muted-foreground rounded"
            style={{ width: `${buffered}%` }}
          ></div>

          {/* Playback progress */}
          <div
            className="absolute h-full bg-primary rounded"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            {/* Seek handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 shadow-md"></div>
          </div>
        </div>
        {/* Controls row */}
        <div className="flex items-center gap-3 h-12">
          {/* Play/Pause */}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-accent/10"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          {/* Skip backward */}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-accent/10"
            onClick={() => skipTime(-10)}
          >
            <SkipBack size={18} />
          </Button>
          {/* Skip forward */}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-accent/10"
            onClick={() => skipTime(10)}
          >
            <SkipForward size={18} />
          </Button>
          {/* Time display */}
          <div className="text-primary-foreground text-sm">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
          {/* Spacer */}
          <div className="flex-grow"></div>
          {/* Volume controls */}
          <div className="flex items-center">
            {" "}
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-accent/10"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </Button>
            <div className="relative w-20 hidden sm:block">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-accent rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-foreground [&::-webkit-slider-thumb]:appearance-none"
              />
            </div>
          </div>
          {/* Settings button */}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-accent/10"
          >
            <Settings size={20} />
          </Button>
          {/* Fullscreen toggle */}{" "}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-accent/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

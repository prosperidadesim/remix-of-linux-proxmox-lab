import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  SkipBack, SkipForward, Settings, Loader2, CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function VideoPlayer({ 
  url, 
  title, 
  poster,
  currentTime = 0, 
  onTimeUpdate, 
  onComplete,
  className 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(currentTime);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Resume from saved position
  useEffect(() => {
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTimeState(current);
      setProgress((current / total) * 100);
      
      // Report progress every 5 seconds
      if (Math.floor(current) % 5 === 0) {
        onTimeUpdate?.(current);
      }

      // Check for completion (90% watched)
      if (!isCompleted && current / total >= 0.9) {
        setIsCompleted(true);
        onComplete?.();
      }
    }
  }, [onTimeUpdate, onComplete, isCompleted]);

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTimeState(newTime);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative group bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        className="w-full h-full object-contain"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onClick={togglePlay}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-success/90 text-success-foreground px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Concluído
        </div>
      )}

      {/* Controls */}
      <div 
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="mb-3"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-20"
              />
            </div>

            <span className="text-white text-sm ml-2">
              {formatTime(currentTimeState)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePlaybackRate(0.5)} className={playbackRate === 0.5 ? 'bg-accent' : ''}>
                  0.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlaybackRate(1)} className={playbackRate === 1 ? 'bg-accent' : ''}>
                  1x (Normal)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlaybackRate(1.25)} className={playbackRate === 1.25 ? 'bg-accent' : ''}>
                  1.25x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlaybackRate(1.5)} className={playbackRate === 1.5 ? 'bg-accent' : ''}>
                  1.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePlaybackRate(2)} className={playbackRate === 2 ? 'bg-accent' : ''}>
                  2x
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      {title && showControls && (
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  text?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 text-blue-600" />
        ) : (
          <Play className="w-4 h-4 text-blue-600" />
        )}
      </button>
      
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
      
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        preload="none"
      />
    </div>
  );
};

export default AudioPlayer;
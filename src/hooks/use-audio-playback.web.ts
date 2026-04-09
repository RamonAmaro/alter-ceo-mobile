import { useEffect, useRef, useState } from "react";

interface AudioPlayerOptions {
  updateInterval?: number;
}

interface AudioPlayer {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
}

interface AudioPlayerStatus {
  playing: boolean;
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  didJustFinish: boolean;
}

interface InternalPlayer extends AudioPlayer {
  _version: number;
  _getAudio: () => HTMLAudioElement | null;
}

export function useAudioPlayer(uri: string | null, _options?: AudioPlayerOptions): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const versionRef = useRef(0);
  const [, forceUpdate] = useState(0);

  const playerRef = useRef<InternalPlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = {
      play: () => {
        audioRef.current?.play();
      },
      pause: () => {
        audioRef.current?.pause();
      },
      seekTo: (seconds: number) => {
        if (audioRef.current) audioRef.current.currentTime = seconds;
      },
      _version: 0,
      _getAudio: () => audioRef.current,
    };
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (uri) {
      const audio = new Audio(uri);
      audio.preload = "auto";
      audioRef.current = audio;
    } else {
      audioRef.current = null;
    }

    versionRef.current += 1;
    playerRef.current!._version = versionRef.current;
    forceUpdate((n) => n + 1);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [uri]);

  return playerRef.current;
}

export function useAudioPlayerStatus(player: AudioPlayer): AudioPlayerStatus {
  const internal = player as InternalPlayer;

  const [status, setStatus] = useState<AudioPlayerStatus>({
    playing: false,
    isLoaded: false,
    duration: 0,
    currentTime: 0,
    didJustFinish: false,
  });

  const version = internal._version;

  useEffect(() => {
    const audio = internal._getAudio();
    if (!audio) {
      setStatus({
        playing: false,
        isLoaded: false,
        duration: 0,
        currentTime: 0,
        didJustFinish: false,
      });
      return;
    }

    function update() {
      if (!audio) return;
      setStatus({
        playing: !audio.paused && !audio.ended,
        isLoaded: audio.readyState >= 2,
        duration: isNaN(audio.duration) ? 0 : audio.duration,
        currentTime: audio.currentTime,
        didJustFinish: audio.ended,
      });
    }

    const events = ["play", "pause", "ended", "loadeddata", "seeked", "timeupdate"] as const;
    for (const evt of events) {
      audio.addEventListener(evt, update);
    }
    update();

    const intervalId = setInterval(update, 100);

    return () => {
      for (const evt of events) {
        audio.removeEventListener(evt, update);
      }
      clearInterval(intervalId);
    };
  }, [internal, version]);

  return status;
}

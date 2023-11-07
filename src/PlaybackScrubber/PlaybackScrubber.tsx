import { useState, useCallback, useEffect, useRef } from 'react';
import { getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import './PlaybackScrubber.css';
import useStableCallback from '../Hooks/useStableCallback';

export interface VideoControlsProps {
  duration: number;
  startingOffset: number;
  player?: YT.Player;
  skips: TimeSegment[];
  playerState: YT.PlayerState;
}

const EditorControlBar = (props: VideoControlsProps) => {
  const duration = props.duration;

  const scrubber = useRef<HTMLInputElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(props.player?.isMuted() || false);
  const isMobile = useMediaQuery({ query: '(max-width: 985px)' });

  const isPlaying = !!props.player && props.playerState === YT.PlayerState.PLAYING

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= Math.floor(duration) && scrubber.current) {
        scrubber.current.value = '0';
        props.player?.pauseVideo();
        props.player?.seekTo(0, true);
      }
    },
    [duration, props.player]
  );

  const seekVideoTo = useCallback(
    (newTime: number) => {
      if (scrubber.current) {
        scrubber.current.style.backgroundSize = `${(newTime * 100) / duration}% 100%`;
        scrubber.current.value = newTime.toString();
        props.player?.seekTo(newTime + props.startingOffset, true);
        setCurrentTime(newTime);
        checkForEndOfVideo(newTime);
      }
    },
    [checkForEndOfVideo, props.player]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCurrentSkip = (time: number): TimeSegment | undefined => {
    if (props.skips) {
      return props.skips.find(skip => skip.start <= time && time < skip.end)
    }
    return;
  }

  const checkForEdits = useCallback(
    (time: number): boolean => {
      let skip;
      let editApplied = false;

      // eslint-disable-next-line no-cond-assign
      while (skip = getCurrentSkip(time)) {
        if (skip.end >= duration) {
          props.player?.pauseVideo();
          seekVideoTo(skip.start - 1);
          time = skip.end
        } else {
          seekVideoTo(skip.end);
          time = skip.end;
        }

        editApplied = true;
      }
      return editApplied;
    },
    [duration, getCurrentSkip, props.player, seekVideoTo]
  );


  const onScrub = useCallback(
    (e: any) => {
      const target = e.currentTarget;
      if (target) {
        const newTime = parseInt(target.value, 10);
        const editApplied = checkForEdits(newTime);

        if (!editApplied) {
          seekVideoTo(newTime);
        }
      }
    },
    [seekVideoTo, checkForEdits]
  );

  const onToggleFullscreen = () => {
    console.log('JC onToggleFullscreen');
  }

  const onPlayVideo = () => {
    props.player?.playVideo();
  }

  const onPauseVideo = () => {
    props.player?.pauseVideo();
  }

  const onVolumeChange = (e: any) => {
    const target = e.currentTarget;
    if (target) {
      const val = target.value;

      target.style.backgroundSize = `${val}% 100%`;
      props.player?.setVolume(parseInt(val, 10));
    }
  }

  const onMuteToggle = () => {
    if (props.player?.isMuted()) {
      props.player?.unMute();
      setIsMuted(false);
    } else {
      props.player?.mute();
      setIsMuted(true);
    }
  }

  const getCurrentTime = () => {
    return (props.player?.getCurrentTime() || 0) - props.startingOffset;
  }

  const onPlayerStateChangeEvent = useStableCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.ENDED && scrubber.current) {
        scrubber.current.value = '0';
        props.player?.pauseVideo();
        props.player?.seekTo(0, true);
      } else if (event.data === YT.PlayerState.PLAYING) {
        checkForEdits(getCurrentTime());
      }
    }, [checkForEdits, duration, props.player]
  )

  const tick = useStableCallback(() => {
    const newTime = Math.round(getCurrentTime()) + 1;
    const editApplied = checkForEdits(newTime);
    setCurrentTime(newTime);
    if (!editApplied) {
      checkForEndOfVideo(newTime);

      if (scrubber.current) {
        scrubber.current.style.backgroundSize = `${(newTime * 100) / duration}% 100%`;
        scrubber.current.value = newTime.toString();
      }
    }
  }, [checkForEdits, checkForEndOfVideo, props.player])

  useEffect(() => {
    if (!isPlaying) {
      checkForEdits(currentTime)
    }
    checkForEndOfVideo(currentTime);
    const updateInterval = isPlaying ? window.setInterval(tick, 1000) : undefined;
    props.player?.addEventListener("onStateChange", onPlayerStateChangeEvent);

    return () => {
      window.clearInterval(updateInterval);
    };
  }, [isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, isMobile, props.playerState, tick, currentTime, onPlayerStateChangeEvent]);

  return (
    <div className={`video-controls ${isPlaying ? 'is-playing' : 'is-paused'}`}>
      <div className='scrubber-container'>
        <input ref={scrubber} type='range' min='0' max={duration} onInput={onScrub} />
      </div>
      <div className='controls-container'>
        {!isPlaying ? (
          <button className='play-pause-control' onClick={onPlayVideo}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              width='24px'
              viewBox='0 0 24 24'
              fill='#FFFFFF'
            >
              <path d='M0 0h24v24H0z' fill='none' />
              <path d='M8 5v14l11-7z' />
            </svg>
          </button>
        ) : (
          <button className='play-pause-control' onClick={onPauseVideo}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              width='24px'
              viewBox='0 0 24 24'
              fill='#FFFFFF'
            >
              <path d='M0 0h24v24H0z' fill='none' />
              <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
            </svg>
          </button>
        )}

        <div className='volume-container'>
          <button className='mute-unmute-control' onClick={onMuteToggle}>
            {isMuted ? (
              <svg
                id='mute-icon'
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                width='24px'
                viewBox='0 0 24 24'
                fill='#FFFFFF'
              >
                <path d='M0 0h24v24H0z' fill='none' />
                <path d='M7 9v6h4l5 5V4l-5 5H7z' />
              </svg>
            ) : (
              <svg
                id='volume-icon'
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                width='24px'
                viewBox='0 0 24 24'
                fill='#FFFFFF'
              >
                <path d='M0 0h24v24H0z' fill='none' />
                <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
              </svg>
            )}
          </button>
          <input
            type='range'
            min='0'
            max='100'
            value={props.player?.getVolume() || 0}
            onInput={onVolumeChange}
            style={{ backgroundSize: `${props.player?.getVolume() || 0}% 100%` }}
          />
        </div>

        <div className='elapsed-time-container'>
          <span>
            {getFormattedTime(currentTime)} / {getFormattedTime(duration)}
          </span>
        </div>
        <div className='fullscreen-toggle-container'>
          <button onClick={onToggleFullscreen}>
            {false ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 0 24 24'
                width='24px'
                fill='#FFFFFF'
              >
                <path d='M0 0h24v24H0z' fill='none' />
                <path d='M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z' />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 0 24 24'
                width='24px'
                fill='#FFFFFF'
              >
                <path d='M0 0h24v24H0z' fill='none' />
                <path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorControlBar;

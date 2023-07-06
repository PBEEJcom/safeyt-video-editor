import { useState, useCallback, useEffect, useRef } from 'react';
import { parseFormattedTime, getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import './EditorControlBar.css'
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';

export interface VideoControlsProps {
  isPlaying: boolean;
  isFullscreen: boolean;
  player?: YT.Player;
  skips?: TimeSegment[];
  videoBounds?: TimeSegment;
  onPlayVideo(): void;
  onPauseVideo(): void;
  onToggleFullscreen(): void;
}

const EditorControlBar = (props: VideoControlsProps) => {
  const videoStartMs = props.videoBounds?.start ? parseFormattedTime(props.videoBounds.start) : 0;
  const videoEndMs = props.videoBounds?.end ? parseFormattedTime(props.videoBounds.end) : props.player?.getDuration() || 0;
  const duration = videoEndMs - videoStartMs;

  const scrubber = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(props.player?.isMuted() || false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 985px)' });

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= duration && scrubber.current) {
        scrubber.current.style.backgroundSize = '100% 100%';
        scrubber.current.value = duration.toString();
        props.player?.seekTo(videoStartMs, true);
        props.onPauseVideo();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [duration, props.player, props.onPauseVideo, scrubber, props.skips]
  );

  const seekVideoTo = useCallback(
    (newTime: number) => {
      if (scrubber.current) {
        scrubber.current.style.backgroundSize = `${(newTime * 100) / duration}% 100%`;
        scrubber.current.value = newTime.toString();
        props.player?.seekTo(newTime + videoStartMs, true);
        setCurrentTime(newTime);
        checkForEndOfVideo(newTime);
      }
    },
    [checkForEndOfVideo, duration, props.player, videoStartMs]
  );

  const checkForEdits = useCallback(
    (currentTime: number): boolean => {
      if (props.skips) {
        for (const skip of props.skips) {
          if (skip.start && skip.end && parseFormattedTime(skip.start) <= currentTime && currentTime < parseFormattedTime(skip.end)) {
            seekVideoTo(parseFormattedTime(skip.end));
            return true;
          }
        }
      }

      return false;
    },
    [props.skips, seekVideoTo]
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

  const onVolumeChange = useCallback(
    (e: any) => {
      const target = e.currentTarget;
      if (target) {
        const val = target.value;

        target.style.backgroundSize = `${val}% 100%`;
        props.player?.setVolume(parseInt(val, 10));
      }
    },
    [props.player]
  );

  const onMuteToggle = useCallback(() => {
    if (props.player?.isMuted()) {
      props.player?.unMute();
      setIsMuted(false);
    } else {
      props.player?.mute();
      setIsMuted(true);
    }
  }, [props.player]);

  useEffect(() => {
    const updateInterval = props.isPlaying
      ? window.setInterval(() => {
          const newTime = Math.ceil(props.player?.getCurrentTime() || 0) + 1 - videoStartMs;
          setCurrentTime(newTime);
          const editApplied = checkForEdits(newTime);
          if (!editApplied) {
            checkForEndOfVideo(newTime);

            if (scrubber.current) {
              scrubber.current.style.backgroundSize = `${(newTime * 100) / duration}% 100%`;
              scrubber.current.value = newTime.toString();
            }
          }
        }, 1000)
      : undefined;

    return () => {
      window.clearInterval(updateInterval);
    };
  }, [props.isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, videoStartMs, isMobile]);

  return (
    <div className={`flex flex-col w-full flex-[0_0_51px] transition-opacity duration-700 ${(props.isPlaying && !isMobile) ? 'opacity-0 hover:opacity-100' : ''}`}>
      <div className='flex flex-[0_0_10px] items-center justify-center py-[10px]'>
        <input 
          ref={scrubber}
          type='range'
          min='0'
          max={duration}
          onInput={onScrub}
          className='appearance-none w-full h-[3px] bg-[#FFFFFF3C] rounded-[5px] bg-gradient-to-r from-[#BC335B] to-[#BC335B] bg-no-repeat bg-0'
        />
      </div>
      <div className='flex align-center flex-auto'>
        {!props.isPlaying ? (
          <button className='flex items-center justify-center' onClick={props.onPlayVideo}>
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
          <button className='flex items-center justify-center' onClick={props.onPauseVideo}>
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

        <div className='flex items-center'>
          <button className='flex align-center justify-center' onClick={onMuteToggle}>
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
            className='appearance-none w-[200px] mr-[15px] h-[5px] bg-[#FFFFFF3C] rounded-[5px
              bg-gradient-to-r from-[#BC335B] to-[#BC335B] bg-[70%] bg-no-repeat bg-0'
            style={{ backgroundSize: `${props.player?.getVolume() || 0}% 100%` }}
          />
        </div>

        <div className='elapsed-time-container text-white'>
          <span>
            {getFormattedTime(currentTime)} / {getFormattedTime(duration)}
          </span>
        </div>
        <div className='flex flex-auto items-center justify-end pr-[10px]'>
          <button onClick={props.onToggleFullscreen}>
            {props.isFullscreen ? (
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
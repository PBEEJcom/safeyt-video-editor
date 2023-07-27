import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCutTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { parseFormattedTime, getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import './EditorControlBar.css'
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import { IconButton, Stack } from '@mui/material';

export interface VideoControlsProps {
  isFullscreen: boolean;
  player?: YT.Player;
  skips?: TimeSegment[];
  videoBounds?: TimeSegment;
  playerContainer: RefObject<HTMLDivElement>;
  playerState: YT.PlayerState;
}

const EditorControlBar = (props: VideoControlsProps) => {
  console.log("player" + props.player)
  const videoStartMs = props.videoBounds?.start ? parseFormattedTime(props.videoBounds.start) : 0;
  const videoEndMs = props.videoBounds?.end ? parseFormattedTime(props.videoBounds.end) : props.player?.getDuration() || 0;
  const duration = videoEndMs - videoStartMs;

  const scrubber = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(props.player?.isMuted() || false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 985px)' });

  const isPlaying = !!props.player && props.playerState === YT.PlayerState.PLAYING

  const onToggleFullscreen = useCallback(async () => {
    if (props.playerContainer.current) {
      // eslint-disable-next-line
      // @ts-ignore
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            // eslint-disable-next-line
            // @ts-ignore
          } else if (document.webkitExitFullscreen) {
            alert('webkitExitFullscreen');
            // eslint-disable-next-line
            // @ts-ignore
            document.webkitExitFullscreen();
          }
          // setIsFullscreen(false);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          if (props.playerContainer.current.requestFullscreen) {
            await props.playerContainer.current.requestFullscreen();
            // setIsFullscreen(true);

            // eslint-disable-next-line
            // @ts-ignore
          } else if (playerContainer.current.webkitRequestFullscreen) {

            // eslint-disable-next-line
            // @ts-ignore
            playerContainer.current.webkitRequestFullscreen();
            // setIsFullscreen(true);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, []);

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= duration && scrubber.current) {
        scrubber.current.style.backgroundSize = '100% 100%';
        scrubber.current.value = duration.toString();
        props.player?.seekTo(videoStartMs, true);
        props.player?.pauseVideo();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [duration, props.player, scrubber, props.skips]
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
    const updateInterval = isPlaying
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
  }, [isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, videoStartMs, isMobile]);

  return (
    <div className={`flex flex-col w-full flex-[0_0_51px] transition-opacity duration-700}`}>
      <div className="flex flex-row justify-between w-full text-[12px]">
        <div>{getFormattedTime(currentTime)}</div>
        <div>{getFormattedTime(duration)}</div>
      </div>
      
      <div className='flex flex-[0_0_10px] items-center justify-center py-[10px]'>
        
        <input 
          ref={scrubber}
          type='range'
          min='0'
          max={duration}
          onInput={onScrub}
          className='appearance-none w-full h-[7px] bg-[#BC335B] rounded-[5px]'
        />
        { props.skips?.map((skip, i) => {
          if (!skip.start || !skip.end){
            return (<div></div>);
          }

          let leftPercent = parseFormattedTime(skip.start)/duration*100
          let widthPercent = (parseFormattedTime(skip.end)-parseFormattedTime(skip.start))/duration*100


          console.log(`${skip.start} start; ${skip.end} end; ${duration} duration;`)
          console.log(`${leftPercent}% left; ${widthPercent}% width;`)

          return (<div key={`${leftPercent}l%-${widthPercent}w%`} className={"bg-[white] h-[7px] absolute border-t border-b border-[#BC335B] z-[0] hover:h-[11px] hover:border-[#fff200] hover:rounded-[2px] hover:border-[2px] skip-block hover:shadow-[0_0_3px_#fff200]"} style={{left: `${leftPercent}%`, width: `${widthPercent}%`}}></div>)
        })}
        
      </div>
    </div>
  );
};

export default EditorControlBar;
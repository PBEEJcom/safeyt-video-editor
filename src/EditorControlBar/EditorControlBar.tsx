import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { parseFormattedTime, getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import './EditorControlBar.css'
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';

export interface VideoControlsProps {
  isFullscreen: boolean;
  player?: YT.Player;
  skips?: TimeSegment[];
  videoBounds?: TimeSegment;
  onPlayVideo(): void;
  playerContainer: RefObject<HTMLDivElement>;
  playerState: YT.PlayerState;
  onPlayVideo: () => void;
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
        pauseVideo();
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

  const pauseVideo = useCallback(() => {
    props.player?.pauseVideo();
  }, [props.player]);

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

          return (<div key={`${leftPercent}l%-${widthPercent}w%`} className={"bg-[white] h-[7px] absolute border-t border-b border-[#BC335B] z-[0] hover:h-[11px] hover:border-[#fff200] hover:rounded-[2px] hover:border-[2px] skip-block"} style={{left: `${leftPercent}%`, width: `${widthPercent}%`}}></div>)
        })}
        
      </div>
      <div className='flex align-center flex-auto'>
        {!isPlaying ? (
          <button className='flex items-center justify-center' onClick={props.onPlayVideo}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
          </button>
        ) : (
          <button className='flex items-center justify-center' onClick={pauseVideo}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.<path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>
          </button>
        )}

        <button className='flex items-center justify-center'><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.<path d="M256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0L256 192zm22.6 150.6L396.8 460.8c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6l-64 64zM64 112a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm48 240a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg></button>
      </div>
    </div>
  );
};

export default EditorControlBar;
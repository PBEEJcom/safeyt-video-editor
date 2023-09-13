import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { parseFormattedTime, getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import './EditorControlBar.css'
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import { nextTick } from 'process';

export interface VideoControlsProps {
  player?: YT.Player;
  skips?: TimeSegment[];
  playerContainer: RefObject<HTMLDivElement>;
  playerState: YT.PlayerState;
}

const EditorControlBar = (props: VideoControlsProps) => {
  const duration = props.player?.getDuration() || 0;

  const scrubber = useRef<HTMLInputElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 985px)' });

  const isPlaying = !!props.player && props.playerState === YT.PlayerState.PLAYING

  console.log("EDITOR render")

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= duration && scrubber.current) {
        scrubber.current.value = duration.toString();
        props.player?.seekTo(0, true);
        props.player?.pauseVideo();
      }
    },
    [duration, props.player]
  );

  const seekVideoTo = useCallback(
    (newTime: number) => {
      if (scrubber.current) {
        scrubber.current.value = newTime.toString();
        props.player?.seekTo(newTime, true);
        setCurrentTime(newTime);
        checkForEndOfVideo(newTime);
      }
    },
    [checkForEndOfVideo, props.player]
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

  const tick = useCallback(() => {
    const newTime = Math.ceil(props.player?.getCurrentTime() || 0) + 1;
    const editApplied = checkForEdits(newTime);
    setCurrentTime(newTime);
    if (!editApplied) {
      checkForEndOfVideo(newTime);

      if (scrubber.current) {
        scrubber.current.value = newTime.toString();
      }
    }
  }, [checkForEdits, checkForEndOfVideo, props.player])

  useEffect(() => {
    checkForEdits(currentTime);
    const updateInterval = isPlaying? window.setInterval(tick, 1000) : undefined;
    
    return () => {
      window.clearInterval(updateInterval);
    };
  }, [isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, isMobile, props.playerState, tick]);

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

          return (<div key={`${leftPercent}l%-${widthPercent}w%`} className={"bg-[white] h-[7px] absolute border-t border-b border-[#BC335B] z-[0] hover:h-[11px] hover:border-[#fff200] hover:rounded-[2px] hover:border-[2px] skip-block hover:shadow-[0_0_3px_#fff200]"} style={{left: `${leftPercent}%`, width: `${widthPercent}%`}}></div>)
        })}
        
      </div>
    </div>
  );
};

export default EditorControlBar;
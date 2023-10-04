import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { parseFormattedTime, getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import './EditorControlBar.css';

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

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= Math.floor(duration) && scrubber.current) {
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

  const getCurrentSkip = useCallback((time: number): TimeSegment | undefined => {
    if (props.skips) {
      return props.skips.find(skip => skip.start && skip.end && parseFormattedTime(skip.start) <= time && time < parseFormattedTime(skip.end))
    }
    return;
  }, [props.skips])

  const checkForEdits = useCallback(
    (time: number): boolean => {
      let skip;
      let editApplied = false;

      // eslint-disable-next-line no-cond-assign
      while (skip = getCurrentSkip(time)) {
        if (skip.end && parseFormattedTime(skip.end) >= duration) {
          // this skip goes to the end
          props.player?.pauseVideo();
          seekVideoTo(parseFormattedTime(skip.start!) - 1);
          time = parseFormattedTime(skip.start!) - 1
        } else {
          seekVideoTo(parseFormattedTime(skip.end!));
          time = parseFormattedTime(skip.end!)
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

  const onPlayerStateChangeEvent = useCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.ENDED && scrubber.current) {
        scrubber.current.value = duration.toString();
        props.player?.seekTo(0, true);
        props.player?.pauseVideo();
      } else if (event.data === YT.PlayerState.PLAYING) {
        checkForEdits(props.player?.getCurrentTime() || 0);
      }
    }, [checkForEdits, duration, props.player]
  )

  const tick = useCallback(() => {
    const newTime = Math.round(props.player?.getCurrentTime() || 0) + 1;
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
    checkForEndOfVideo(currentTime);
    const updateInterval = isPlaying ? window.setInterval(tick, 1000) : undefined;
    props.player?.addEventListener("onStateChange", onPlayerStateChangeEvent);
    
    return () => {
      window.clearInterval(updateInterval);
    };
  }, [isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, isMobile, props.playerState, tick, currentTime, onPlayerStateChangeEvent]);

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
            return (<div key={i}></div>);
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
import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import './EditorControlBar.css';
import useStableCallback from '../Hooks/useStableCallback';

export interface VideoControlsProps {
  player?: YT.Player;
  skips?: TimeSegment[];
  playerContainer: RefObject<HTMLDivElement>;
  playerState: YT.PlayerState;
  handleEditSkip: (iindex: number) => void
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
        seekVideoTo(skip.end);
        time = skip.end;
        editApplied = true;
      }
      return editApplied;
    },
    [getCurrentSkip, seekVideoTo]
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

  const onPlayerStateChangeEvent = useStableCallback(
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

  const tick = useStableCallback(() => {
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
    if (!isPlaying) {
      checkForEdits(currentTime)
    }
    checkForEndOfVideo(currentTime);
    const updateInterval = isPlaying ? window.setInterval(tick, 1000) : undefined;
    props.player?.addEventListener("onStateChange", onPlayerStateChangeEvent);

    return () => {
      window.clearInterval(updateInterval);
      props.player?.removeEventListener("onStateChange", onPlayerStateChangeEvent);
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
          let leftPercent = skip.start/duration*100
          let widthPercent = (skip.end-skip.start)/duration*100

          return (<div onClick={() => props.handleEditSkip(i)} key={`${leftPercent}l%-${widthPercent}w%`} className={"bg-[white] opacity-90 h-[7px] absolute z-[0] hover:h-[11px] hover:border-[#fff200] hover:rounded-[2px] hover:border-[2px] skip-block hover:shadow-[0_0_3px_#fff200] cursor-pointer"} style={{left: `${leftPercent}%`, width: `${widthPercent}%`}}></div>)
        })}

      </div>
    </div>
  );
};

export default EditorControlBar;

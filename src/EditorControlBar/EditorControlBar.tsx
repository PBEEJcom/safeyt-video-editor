import { useState, useCallback, useEffect, useRef } from 'react';
import { getFormattedTime } from '../Utils/Time';
import { useMediaQuery } from 'react-responsive';
import YouTube, { TimeSegment } from '../Utils/YouTube';
import './EditorControlBar.css';
import useStableCallback from '../Hooks/useStableCallback';
import { Tooltip } from '@mui/material';

export interface VideoControlsProps {
  player?: YT.Player;
  skips: TimeSegment[];
  playerState: YT.PlayerState;
  handleEditSkip: (index: number, isEditingBounds: boolean) => void;
}

const EditorControlBar = (props: VideoControlsProps) => {
  const duration = Math.floor(props.player?.getDuration() || 0);

  const scrubber = useRef<HTMLInputElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 985px)' });

  const isPlaying = !!props.player && props.playerState === YT.PlayerState.PLAYING

  const checkForEndOfVideo = useCallback(
    (currentTime: number) => {
      if (currentTime >= Math.floor(duration) && scrubber.current) {
        scrubber.current.value = duration.toString();
        props.player?.seekTo(0, false);
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
        if (skip.end >= duration) {
          props.player?.pauseVideo();
          seekVideoTo(skip.start - 1);
          time = skip.start - 1
        } else {
          seekVideoTo(skip.end);
          time = skip.end;
        }

        editApplied = true;
      }
      return editApplied;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (currentTime >= Math.floor(duration) && scrubber.current) {
          seekVideoTo(0)
          props.player?.playVideo();
        }
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
    };
  }, [isPlaying, props.player, duration, checkForEndOfVideo, checkForEdits, isMobile, props.playerState, tick, currentTime, onPlayerStateChangeEvent]);

  useEffect(() => {
    props.player?.pauseVideo();
    seekVideoTo(0);
    
    const videoId = YouTube.extractVideoId(props.player?.getVideoUrl() || "");
    if (videoId) {
      console.log(videoId)
      props.player?.cueVideoById(videoId);
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.player])

  return (
    <div className={`edit-scrubber-container flex flex-col w-full flex-[0_0_51px] transition-opacity duration-700}`}>
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
          let end = skip.end === Infinity ? duration : skip.end;
          let widthPercent = (end-skip.start)/duration*100

          return (
            <Tooltip title="Click to edit" arrow placement="top">
              <div onClick={() => props.handleEditSkip(i, !!skip.isAtBounds)} key={`${leftPercent}l%-${widthPercent}w%`} className={"bg-[white] opacity-90 h-[7px] absolute z-[0] hover:h-[11px] hover:border-[#fff200] hover:rounded-[2px] hover:border-[2px] skip-block hover:shadow-[0_0_3px_#fff200] cursor-pointer"} style={{left: `${leftPercent}%`, width: `${widthPercent}%`}}>
              </div>
            </Tooltip>)
        })}

      </div>
    </div>
  );
};

export default EditorControlBar;

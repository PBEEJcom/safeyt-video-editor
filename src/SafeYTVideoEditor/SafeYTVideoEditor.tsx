import { Input, Button, IconButton, Stack, Fade } from '@mui/material';
import Slider from '@mui/material/Slider';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCutTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCropIcon from '@mui/icons-material/Crop';
import { Fragment, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import YouTube, { TimeSegment } from '../Utils/YouTube';
import { getFormattedTime, parseFormattedTime } from '../Utils/Time';
import React from 'react';
import EditorControlBar from '../EditorControlBar/EditorControlBar';
import './SafeYTVideoEditor.css';
import { Close, Delete, IndeterminateCheckBoxSharp } from '@mui/icons-material';

export interface SafeYTDialogProps {
  open: boolean;
  youTubeLink: string;
  onClose: (value: string) => void;
}

const SafeYT = (props: SafeYTDialogProps) => {
  const [isEditingBounds, setIsEditingBounds] = useState<boolean>(false);
  const [skips, setSkips] = useState<TimeSegment[]>([]);
  const [startingSkip, setStartingSkip] = useState<TimeSegment>({})
  const [endingSkip, setEndingSkip] = useState<TimeSegment>({})
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);
  const [skipEditingIndex, setSkipEditingIndex] = useState<number | undefined>(undefined);

  let playerContainer: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const videoId = YouTube.extractVideoId(props.youTubeLink);
  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING;

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    setPlayer(event.target);
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    setPlayerState(event.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    YT.ready(() => {
      if (!videoId) {
        return;
      }

      player?.destroy();

      new YT.Player(`player`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        host: 'https://www.youtube-nocookie.com',
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        },
        playerVars: {
          iv_load_policy: 3,
          cc_load_policy: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          controls: 0,
          autoplay: 0,
          disablekb: 1,
          fs: 0,
          origin: 'https://pbeej.com',
          mute: 0,
        },
      });
    });
  }, [videoId, onPlayerReady, onPlayerStateChange]);

  const onSkipStartChanged = useCallback(
    (skipIndex: number, newStart?: string) => {
      skips[skipIndex].start = newStart;
      setSkips([...skips]);
    },
    [skips]
  );

  const onSkipEndChanged = useCallback(
    (skipIndex: number, newStart?: string) => {
      skips[skipIndex].end = newStart;
      setSkips([...skips]);
    },
    [skips]
  );

  const onAddSkip = useCallback(() => {
    const newSkip = {};
    const newSkips = skips.concat(newSkip);
    setSkips(newSkips);
  }, [skips]);

  const deleteSkipBeingEdited = () => {
    console.log("skipEditIndex", skipEditingIndex)
    if (skipEditingIndex !== undefined) {
      let newSkips = skips;
      console.log("skipeditindex-arrya", skips)
      newSkips.splice(skipEditingIndex, 1)
      setSkips(newSkips)
      setSkipEditingIndex(undefined)
    }
  }

  const cancelSkipEdit = () => {
    setSkipEditingIndex(undefined)
  }

  const addDefaultSkip = useCallback(() => {
    const startTimeSeconds = (player?.getCurrentTime() || 0) + 1;
    const endTimeSeconds = startTimeSeconds + 15;

    const newSkip = {
      start: getFormattedTime(startTimeSeconds),
      end: getFormattedTime(endTimeSeconds)
    }

    const newSkips = skips.concat(newSkip);
    setSkips(newSkips)
    setSkipEditingIndex(newSkips.length - 1)
  }, [player, skips])

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  const toggleEditBounds = useCallback(() => {
    setIsEditingBounds(!isEditingBounds);
    setSkipEditingIndex(undefined);
  }, [isEditingBounds])

  const handleEditSkip = (index: number) => {
    console.log("skip edit index:", index)
    setSkipEditingIndex(index);
    setIsEditingBounds(false);
  }

  const handleChangeVideoBounds = (event: React.SyntheticEvent | Event, value: number | number[]) => {
    if (!player) {
      return;
    }

    const newBoundsArray = value as number[]

    // enforce minimum distance of 1s
    if (newBoundsArray[1] - newBoundsArray[0] < 1) {
      newBoundsArray[0] = newBoundsArray[1] - 1
    }

    const newStartString = getFormattedTime(newBoundsArray[0])
    const newEndString = getFormattedTime(newBoundsArray[1])
    const currentEndString = getFormattedTime(player?.getDuration());

    setStartingSkip({
      start: "00:00",
      end: newStartString
    })

    setEndingSkip({
      start: newEndString,
      end: currentEndString
    })
  };

  const handleChangeSkipBounds = (event: React.SyntheticEvent | Event, value: number | number[], index: number) => {
    console.log('JC handle skip bounds change', event, value, index);

    setSkips((skips) => {
      if (Array.isArray(value)) {
        skips[index].start = getFormattedTime(value[0]);
        skips[index].end = getFormattedTime(value[1]);
      }

      return [...skips];
    })
  };

  // check for collisions in skips
  useMemo(() => {
    const allSkips = [...skips, startingSkip, endingSkip]
    console.log()

    let collidingSkip: TimeSegment | undefined;
    
    let newSkips = skips;

    skips.forEach((skip, index) => {
      // eslint-disable-next-line no-cond-assign
      while (collidingSkip = allSkips.find(cs => parseFormattedTime(cs.start || "") < parseFormattedTime(skip.end || "") && parseFormattedTime(cs.end || "") > parseFormattedTime(skip.end || ""))) {
        newSkips[index].end = collidingSkip.start;
      }
      
      if (parseFormattedTime(startingSkip.end || "") > parseFormattedTime(skip.start || "")) {
        newSkips[index].start = startingSkip.end
      }

      if (parseFormattedTime(endingSkip.start || "") < parseFormattedTime(skip.end || "")) {
        newSkips[index].end = startingSkip.start
      }
    })



    setSkips(newSkips)
  }, [skips, startingSkip, endingSkip])

  return (
    <div className='flex flex-auto items-center justify-center flex-col p-3'>
      {props.youTubeLink && (
        <Fragment>
          <div className='w-[500px] h-[300px]'>
              <div ref={playerContainer} className='flex align-center justify-center overflow-hidden bg-black relative h-full'>
          <div className='h-full w-full relative overflow-hidden'>
            <div id='player' />
          </div>

          <div className='absolute top-0 h-full w-full flex flex-col'>
            <div className='flex items-center justify-center flex-auto'>
              {!isPlaying && (
                <button className='w-[70px] h-[48px] rounded-[10px] bg-[#BC335B] flex items-center justify-center' onClick={playVideo}>
                  <svg
                    className='mr-[2px]'
                    xmlns='http://www.w3.org/2000/svg'
                    height='35px'
                    viewBox='0 0 24 24'
                    width='35px'
                    fill='#FFFFFF'
                  >
                    <path d='M0 0h24v24H0z' fill='none' />
                    <path d='M8 5v14l11-7z' />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
          </div>
          <div className="relative w-[500px]">
            <EditorControlBar
                player={player}
                skips={[...skips, startingSkip, endingSkip]}
                playerState={playerState}
                playerContainer={playerContainer} 
                handleEditSkip={handleEditSkip}/>
          </div>
          <Fade in={isEditingBounds}>
              <div className="w-[500px] relative top-[-27px] h-0">
                <Slider
                  disableSwap
                  color='secondary'
                  size="small"
                  value={[parseFormattedTime(startingSkip.end || "0"), endingSkip.start ? parseFormattedTime(endingSkip.start) : player?.getDuration() || 0]}
                  min={0}
                  max={player?.getDuration() || 0}
                  onChange={handleChangeVideoBounds}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value: number) => {return getFormattedTime(value)}}
                />
              </div>
            </Fade>
            {skips.map((skip, index) => (
              <Fade in={skipEditingIndex === index}>
                <div className="w-[500px] relative top-[-27px] h-0">
                  <Slider
                    disableSwap
                    size="small"
                    value={[parseFormattedTime(skip.start || ''), parseFormattedTime(skip.end || '')]}
                    min={0}
                    max={player?.getDuration() || 0}
                    onChange={(event, value) => handleChangeSkipBounds(event, value, index)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value: number) => {return getFormattedTime(value)}}
                  />
                </div>
              </Fade>
            ))}
          <Stack direction="row" spacing={1}>
            {skipEditingIndex === undefined ?
              <IconButton onClick={toggleEditBounds} color={isEditingBounds ? "primary" : "default"}>
                { isEditingBounds ? <Close /> : <ContentCropIcon /> }
              </IconButton>
              : <IconButton onClick={deleteSkipBeingEdited} color="error">
                <Delete />
              </IconButton>
            }
            {isPlaying ?
              <IconButton onClick={pauseVideo}>
                <PauseIcon />
              </IconButton>
              : <IconButton onClick={playVideo}>
                <PlayArrowIcon />
              </IconButton>
            }
            {skipEditingIndex === undefined ?
            <IconButton onClick={addDefaultSkip}>
              <ContentCutIcon />
            </IconButton>
            : <IconButton color="primary" onClick={cancelSkipEdit}>
            <Close />
          </IconButton>}
          </Stack>
        </Fragment>
      )}
    </div>
  );
};

export default SafeYT;

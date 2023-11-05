import { IconButton, Stack, Fade, Zoom, Tooltip } from '@mui/material';
import Slider from '@mui/material/Slider';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCutTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCropIcon from '@mui/icons-material/Crop';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import YouTube, { TimeSegment } from '../Utils/YouTube';
import { getFormattedTime } from '../Utils/Time';
import React from 'react';
import EditorControlBar from '../EditorControlBar/EditorControlBar';
import './SafeYTVideoEditor.css';
import { Delete } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';

export interface SafeYTDialogProps {
  open: boolean;
  link: string;
  onSafeYTLinkChange: (safeYTLink: string) => void;
}

const SafeYTVideoEditor = (props: SafeYTDialogProps) => {
  const [isEditingBounds, setIsEditingBounds] = useState<boolean>(false);
  const [skips, setSkips] = useState<TimeSegment[]>([]);
  const [startingSkip, setStartingSkip] = useState<TimeSegment | undefined>(undefined);
  const [endingSkip, setEndingSkip] = useState<TimeSegment | undefined>(undefined);
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);
  const [skipEditingIndex, setSkipEditingIndex] = useState<number | undefined>(undefined);
  const [videoId, setVideoId] = useState<string>("");

  // const videoId = YouTube.extractVideoId(props.link);
  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING;
  const fullVideoDuration = Math.floor(player?.getDuration() || 0);

  const allSkips = useMemo(() => {
    const value = [...skips]

    if (startingSkip) {
      value.push(startingSkip);
    }

    if (endingSkip) {
      value.push(endingSkip);
    }

    return value;
  }, [skips, startingSkip, endingSkip])

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    setPlayer(event.target);
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    setPlayerState(event.data);
  }, []);

  useEffect(() => {
    if (YouTube.isValidYouTubeLink(props.link)) {
      setVideoId(YouTube.extractVideoId(props.link) || "");
      setStartingSkip(undefined);
      setEndingSkip(undefined);
      setSkips([]);
      setIsEditingBounds(false);
      setSkipEditingIndex(undefined);
      setPlayerState(-1);
    } else if (YouTube.isValidSafeYTLink(props.link)) {
      const safeYTData = YouTube.decodeSafeYTLink(props.link);
      setVideoId(safeYTData.videoId);
      if (safeYTData.videoBounds?.start) {
        setStartingSkip({ start: 0, end: parseInt(safeYTData.videoBounds.start), isAtBounds: true });
      } else {
        setStartingSkip(undefined)
      }
      if (safeYTData.videoBounds?.end) {
        setEndingSkip({ start: parseInt(safeYTData.videoBounds.end), end: fullVideoDuration, isAtBounds: true });
      } else {
        setEndingSkip(undefined)
      }
      setSkips(safeYTData.skips.map(skip => ({ start: parseInt(skip.start), end: parseInt(skip.end) })));
      setIsEditingBounds(false);
      setSkipEditingIndex(undefined);
      setPlayerState(-1);
    }
  }, [fullVideoDuration, props.link]);

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
  }, [videoId, onPlayerReady, onPlayerStateChange]); // eslint-disable-line react-hooks/exhaustive-deps


  const checkForSkipCollisionsAndUpdateSkips = (newSkips: TimeSegment[], newStartingSkip: TimeSegment | undefined, newEndingSkip: TimeSegment | undefined) => {
      newSkips.forEach((skip, index) => {
        newSkips.forEach(cs => {
          if (cs.start < skip.end && cs.end > skip.end) {
            newSkips[index].end = cs.start;
          }
        });

        if (newStartingSkip && newStartingSkip.end > skip.start && newStartingSkip.end < skip.end) {
          newSkips[index].start = newStartingSkip.end
        }

        if (newEndingSkip && newEndingSkip.start < skip.end && newEndingSkip.start > skip.start) {
          newSkips[index].end = newEndingSkip.start
        }
      });

      setSkips(newSkips);
      setStartingSkip(newStartingSkip);
      setEndingSkip(newEndingSkip)
  }

  const deleteSkipBeingEdited = () => {
    if (skipEditingIndex !== undefined) {
      let newSkips = [...skips];
      newSkips.splice(skipEditingIndex, 1)
      setSkips(newSkips)
      setSkipEditingIndex(undefined)
    }
  }

  const cancelSkipEdit = () => {
    setSkipEditingIndex(undefined)
    setIsEditingBounds(false)
  }

  const addDefaultSkip = () => {
    const startTimeSeconds = (player?.getCurrentTime() || 0) + 1;
    const endTimeSeconds = startTimeSeconds + 15;

    const newSkip = {
      start: startTimeSeconds,
      end: endTimeSeconds
    }

    const newSkips = skips.concat(newSkip);
    checkForSkipCollisionsAndUpdateSkips(newSkips, startingSkip, endingSkip);
    handleEditSkip(newSkips.length - 1)
  }

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  const toggleEditBounds = () => {
    setIsEditingBounds(!isEditingBounds);
    setSkipEditingIndex(undefined);
  }

  const handleEditSkip = (index: number) => {
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

    const newStart = newBoundsArray[0];
    const newEnd = newBoundsArray[1];

    const newStartingSkip = {
      start: 0,
      end: newStart,
      isAtBounds: true
    }

    const newEndingSkip = {
      start: newEnd,
      end: fullVideoDuration,
      isAtBounds: true
    }

    checkForSkipCollisionsAndUpdateSkips(skips, newStartingSkip, newEndingSkip)
  };

  const handleChangeSkipBounds = (event: React.SyntheticEvent | Event, value: number | number[], index: number) => {
    if (Array.isArray(value)) {
      const newSkips = [...skips];
      newSkips[index].start = value[0];
      newSkips[index].end = value[1];

      checkForSkipCollisionsAndUpdateSkips(newSkips, startingSkip, endingSkip);
    }
  };

  const deleteBounds = () => {
    setStartingSkip(undefined)
    setEndingSkip(undefined)
    setIsEditingBounds(false)
  }

  props.onSafeYTLinkChange(YouTube.getSafeYtLink(videoId, skips, {start: startingSkip?.end || 0, end: endingSkip?.start || fullVideoDuration}))

  return (
    <div className='flex flex-auto items-center justify-center flex-col p-3'>
      {videoId && (
        <Fragment>
          <div className='w-[500px] h-[300px]'>
              <div className='flex align-center justify-center overflow-hidden bg-black relative h-full'>
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
                skips={allSkips}
                playerState={playerState}
                handleEditSkip={handleEditSkip}
                handleEditBounds={toggleEditBounds}/>
          </div>
          <Fade in={isEditingBounds}>
              <div className="w-[500px] relative top-[-27px] h-0">
                <Slider
                  disableSwap
                  color='secondary'
                  size="small"
                  value={[startingSkip ? startingSkip.end : 0, endingSkip ? endingSkip.start : fullVideoDuration]}
                  min={0}
                  max={fullVideoDuration}
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
                    value={[skip.start, skip.end]}
                    min={0}
                    max={fullVideoDuration}
                    onChange={(event, value) => handleChangeSkipBounds(event, value, index)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value: number) => {return getFormattedTime(value)}}
                  />
                </div>
              </Fade>
            ))}
          <Stack direction="row" spacing={1} className='items-start'>
            <Stack>
              <Tooltip title={isEditingBounds ? "Done" : "Trim"} arrow placement="left">
                <IconButton onClick={toggleEditBounds} color={isEditingBounds ? "primary" : "default"}>
                  { isEditingBounds ? <CheckIcon /> : <ContentCropIcon /> }
                </IconButton>
              </Tooltip>
              <Zoom in={isEditingBounds}>
                <Tooltip title="Remove" arrow placement="left">
                  <IconButton onClick={deleteBounds} color="error">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Zoom>
            </Stack>
            {isPlaying ?
              <IconButton onClick={pauseVideo}>
                <PauseIcon />
              </IconButton>
              : <IconButton onClick={playVideo}>
                  <PlayArrowIcon />
                </IconButton>
            }

            <Stack>
              {skipEditingIndex === undefined ?
              <Tooltip title="New Skip" arrow placement="right">
                <IconButton onClick={addDefaultSkip}>
                  <ContentCutIcon />
                </IconButton>
              </Tooltip>
              : <Tooltip title="Done" arrow placement="right">
                <IconButton color="primary" onClick={cancelSkipEdit}>
                  <CheckIcon />
                </IconButton>
              </Tooltip> }
              <Zoom in={skipEditingIndex !== undefined}>
                <Tooltip title="Remove" arrow placement="right">
                  <IconButton onClick={deleteSkipBeingEdited} color="error">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Zoom>
            </Stack>
          </Stack>
        </Fragment>
      )}
    </div>
  );
};

export default SafeYTVideoEditor;

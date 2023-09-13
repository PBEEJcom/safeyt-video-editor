import { Input, Button, IconButton, Stack } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';
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

export interface SafeYTDialogProps {
  open: boolean;
  youTubeLink: string;
  onClose: (value: string) => void;
}

const SafeYT = (props: SafeYTDialogProps) => {
  const [isEditingBounds, setIsEditingBounds] = useState<boolean>(false);
  const [skips, setSkips] = useState<TimeSegment[]>([]);
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [videoBounds, setVideoBounds] = useState<TimeSegment>();
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);

  let playerContainer: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const videoId = YouTube.extractVideoId(props.youTubeLink);
  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING;
  const videoStartSeconds = parseFormattedTime(videoBounds?.start || "00:00");
  const videoEndSeconds = parseFormattedTime(videoBounds?.end || getFormattedTime(player?.getDuration() || 0));

  console.log("EDITOR render")

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    console.log("setting player")
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

      console.log("MAKING A NEW PLAYER (not setting)")

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
          start: videoBounds?.start ? parseFormattedTime(videoBounds.start) : undefined,
          end: videoBounds?.end ? parseFormattedTime(videoBounds.end) : undefined,
        },
      });
    });
  }, [videoId, videoBounds, onPlayerReady, onPlayerStateChange]);

  const onVideoBoundsStartChange = useCallback(
    (newStart: string = '') => {
      let parsedStart: number;
      try {
        parsedStart = parseFormattedTime(newStart);

        if (parsedStart <= 0 || !Number.isFinite(parsedStart)) {
          return;
        }
      } catch(err) {
        console.error(err);
        return;
      }

      if (videoBounds?.end) {
        if (parsedStart < parseFormattedTime(videoBounds.end)) {
          console.log("ABOUT TO MAKE THE NEW start: ", newStart)
          setVideoBounds((videoBounds) => ({
            ...videoBounds,
            start: newStart,
          }));
        }
      } else {
        console.log("ABOUT TO MAKE THE NEW start: ", newStart)
        setVideoBounds({ start: newStart });
      }
    },
    [videoBounds]
  );

  const onVideoBoundsEndChange = useCallback(
    (newEnd: string = '') => {
      let parsedEnd: number;
      try {
        parsedEnd = parseFormattedTime(newEnd);

        if (parsedEnd <= 0 || !Number.isFinite(parsedEnd)) {
          return;
        }
      } catch(err) {
        console.error(err);
        return;
      }

      if (videoBounds?.start) {
        if (parseFormattedTime(videoBounds.start) < parsedEnd) {
          setVideoBounds((videoBounds) => ({
            ...videoBounds,
            end: newEnd,
          }));
        }
      } else {
        setVideoBounds({ end: newEnd });
      }
    },
    [videoBounds]
  );

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

  const addDefaultSkip = useCallback(() => {
    const startTimeSeconds = (player?.getCurrentTime() || 0) + 1;
    const endTimeSeconds = startTimeSeconds + 15;

    const newSkip = {
      start: getFormattedTime(startTimeSeconds),
      end: getFormattedTime(endTimeSeconds)
    }

    const newSkips = skips.concat(newSkip);
    setSkips(newSkips)
  }, [player, skips])

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  const toggleEditBounds = useCallback(() => {
    setIsEditingBounds(!isEditingBounds);
  }, [isEditingBounds])

  const handleChangeVideoBounds = (event: React.SyntheticEvent | Event, value: number | number[]) => {
    if (!player) {
      return;
    }

    const newBoundsArray = value as number[]

    console.log("incoming new bounds: ", newBoundsArray, player?.getDuration())
    console.log("calculated new start: ", getFormattedTime(newBoundsArray[0] * player?.getDuration() / 100))

        onVideoBoundsEndChange(getFormattedTime(newBoundsArray[1] * player?.getDuration() / 100))

    onVideoBoundsStartChange(getFormattedTime(newBoundsArray[0] * player?.getDuration() / 100))
    // onVideoBoundsEndChange(getFormattedTime(newBoundsArray[1] * player?.getDuration() / 100))

    console.log("new video bounds: ", videoBounds?.start, videoBounds?.end)
  };

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
                skips={skips}
                videoBounds={videoBounds}
                playerState={playerState}
                playerContainer={playerContainer} />
            </div>
            <Collapse in={isEditingBounds}>
            <div className="w-[500px]">
              <Slider
                size="small"
                defaultValue={[0, 100]}
                min={0}
                max={100}
                onChangeCommitted={handleChangeVideoBounds}
                valueLabelDisplay="auto"
                valueLabelFormat={(value: number) => {return getFormattedTime(value * (player?.getDuration() || 0) / 100)}}
              />
            </div>
            </Collapse>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={toggleEditBounds} color={isEditingBounds ? "secondary" : "default"}>
                <ContentCropIcon />
              </IconButton>
                {isPlaying ?
                <IconButton onClick={pauseVideo}>
                  <PauseIcon />
                </IconButton>
                : <IconButton onClick={playVideo}>
                  <PlayArrowIcon />
                </IconButton>
                }
              <IconButton onClick={addDefaultSkip}>
                <ContentCutIcon />
              </IconButton>
            </Stack>
          <div>
            <p>Video</p>
            <Input
              placeholder='start time'
              value={videoBounds?.start}
              onChange={(e: any) => onVideoBoundsStartChange(e?.target?.value)} />
            <Input
              placeholder='end time'
              value={videoBounds?.end}
              onChange={(e: any) => onVideoBoundsEndChange(e?.target?.value)} />

            <p>Skips</p>
            {skips.map((skip, skipIndex) => (
              <div key={skipIndex}>
                <Input
                  placeholder='start time'
                  value={skip.start}
                  onChange={(e: any) => onSkipStartChanged(skipIndex, e?.target?.value)} />
                <Input
                  placeholder='end time'
                  value={skip.end}
                  onChange={(e: any) => onSkipEndChanged(skipIndex, e?.target?.value)} />
              </div>
            ))}
            <Button onClick={onAddSkip}>Add Skip</Button>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default SafeYT;
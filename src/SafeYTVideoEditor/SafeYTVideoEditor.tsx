import { Input, Button, IconButton, Stack } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCutTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCropIcon from '@mui/icons-material/Crop';
import { Fragment, RefObject, useCallback, useRef, useState } from 'react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import YouTube, { TimeSegment } from '../Utils/YouTube';
import { getFormattedTime, parseFormattedTime } from '../Utils/Time';
import React from 'react';
import EditorControlBar from '../EditorControlBar/EditorControlBar';

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
          setVideoBounds({
            ...videoBounds,
            start: newStart,
          });
        }
      } else {
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
          setVideoBounds({
            ...videoBounds,
            end: newEnd,
          });
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

  const handleChangeVideoBounds = (event: Event, newBounds: number | number[]) => {
    // const newBoundsArray = newBounds as number[]
    // onVideoBoundsStartChange(getFormattedTime(newBoundsArray[0]))
    // onVideoBoundsEndChange(getFormattedTime(newBoundsArray[1]))
  };

  const videoId = YouTube.extractVideoId(props.youTubeLink)
  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING

  return (
        <div className='flex flex-auto items-center justify-center flex-col p-3'>
      {props.youTubeLink && (
        <Fragment>
          <div className='w-[500px] h-[300px]'>
            <VideoPlayer key={videoId} videoId={videoId} videoBounds={videoBounds} onSetPlayer={setPlayer} onSetPlayerState={setPlayerState} playerContainer={playerContainer} onPlayVideo={playVideo}/>
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
                
                getAriaLabel={() => 'Temperature range'}
                value={[0, 256]}
                onChange={handleChangeVideoBounds}
                valueLabelDisplay="auto"
                // getAriaValueText={valuetext}
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
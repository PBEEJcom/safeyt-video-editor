import { Dialog, Input, Button, DialogTitle, DialogActions, IconButton, Stack } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCutIcon from '@mui/icons-material/ContentCutTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [skips, setSkips] = useState<TimeSegment[]>([]);
  const [videoBounds, setVideoBounds] = useState<TimeSegment>();
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);

  let playerContainer: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  // const { videoId, skips, videoBounds } = useMemo(() => {
  //   try {
  //     return JSON.parse(atob(props.encodedVideoInformation));
  //   } catch {
  //     return {
  //       videoId: undefined,
  //       skips: [],
  //       videoBounds: undefined,
  //     }
  //   }
  // }, [props.encodedVideoInformation]);

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

  const handleSave = (event: {}, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    };

    props.onClose(YouTube.getSafeYtLink(props.youTubeLink, skips, videoBounds));
  }

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  const handleCancel = () => {
    setSkips([]);
    setVideoBounds(undefined);
    props.onClose(YouTube.getSafeYtLink(props.youTubeLink, [], undefined));
  }

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
                isFullscreen={isFullscreen}
                skips={skips}
                videoBounds={videoBounds}
                playerState={playerState}
                playerContainer={playerContainer} />
            </div>
            <Stack direction="row" spacing={1}>
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
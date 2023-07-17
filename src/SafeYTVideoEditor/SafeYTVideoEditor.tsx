import { Dialog, Input, Button, DialogTitle, DialogActions } from '@mui/material';
import { Fragment, useCallback, useState } from 'react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import YouTube, { TimeSegment } from '../Utils/YouTube';
import { parseFormattedTime } from '../Utils/Time';
import React from 'react';

export interface SafeYTDialogProps {
  open: boolean;
  youTubeLink: string;
  onClose: (value: string) => void;
}

const SafeYT = (props: SafeYTDialogProps) => {
  const [skips, setSkips] = useState<TimeSegment[]>([]);
  const [videoBounds, setVideoBounds] = useState<TimeSegment>();

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

  const handleSave = (event: {}, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    };

    props.onClose(YouTube.getSafeYtLink(props.youTubeLink, skips, videoBounds));
  }

  const handleCancel = () => {
    setSkips([]);
    setVideoBounds(undefined);
    props.onClose(YouTube.getSafeYtLink(props.youTubeLink, [], undefined));
  }

  const encodedVideoInformation = YouTube.getEncodedSafeYTVideoInformation(YouTube.extractVideoId(props.youTubeLink), skips, videoBounds);

  return (
        <div className='flex flex-auto items-center justify-center flex-col p-3'>
      {props.youTubeLink && (
        <Fragment>
          <div className='w-[500px] h-[300px]'>
            <VideoPlayer key={encodedVideoInformation} encodedVideoInformation={encodedVideoInformation} />
          </div>
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
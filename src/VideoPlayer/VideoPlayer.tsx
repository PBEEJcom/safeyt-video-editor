import React, { RefObject } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { parseFormattedTime } from '../Utils/Time';
import './VideoPlayer.css'
import { TimeSegment } from '../Utils/YouTube';

export interface YTPlayerProps {
  videoId: string | undefined;
  videoBounds: TimeSegment | undefined;
  onSetPlayer: (player: YT.Player) => void;
  onSetPlayerState: (playerState: YT.PlayerState) => void;
  playerContainer: RefObject<HTMLDivElement>;
  onPlayVideo: () => void;
}

const YTPlayer = (props: YTPlayerProps) => {
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);

  console.log("PLAYER render")

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    props.onSetPlayer(event.target);
    setPlayer(event.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    props.onSetPlayerState(event.data);
    setPlayerState(event.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  window.setInterval(() => console.log(player?.getCurrentTime()), 1000)

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    YT.ready(() => {
      if (!props.videoId) {
        return;
      }

      // player?.destroy();

      new YT.Player(`player`, {
        height: '100%',
        width: '100%',
        videoId: props.videoId,
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
          start: props.videoBounds?.start ? parseFormattedTime(props.videoBounds.start) : undefined,
          end: props.videoBounds?.end ? parseFormattedTime(props.videoBounds.end) : undefined,
        },
      });
    });
  }, [props.videoId, props.videoBounds, onPlayerReady, onPlayerStateChange]);

  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING;

  return (
    <><div ref={props.playerContainer} className='flex align-center justify-center overflow-hidden bg-black relative h-full'>
      <div className='h-full w-full relative overflow-hidden'>
        <div id='player' />
      </div>

      <div className='absolute top-0 h-full w-full flex flex-col'>
        <div className='flex items-center justify-center flex-auto'>
          {!isPlaying && (
            <button className='w-[70px] h-[48px] rounded-[10px] bg-[#BC335B] flex items-center justify-center' onClick={props.onPlayVideo}>
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
    </>
  );
};

export default YTPlayer;
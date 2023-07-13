import React from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import VideoControls from '../EditorControlBar/EditorControlBar';
import { parseFormattedTime } from '../Utils/Time';
import './VideoPlayer.css'

export interface YTPlayerProps {
  encodedVideoInformation: string;
}

const YTPlayer = (props: YTPlayerProps) => {
  const [player, setPlayer] = useState<YT.Player | undefined>(undefined);
  const [playerState, setPlayerState] = useState<YT.PlayerState>(-1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainer = useRef<HTMLDivElement>(null);

  const { videoId, skips, videoBounds } = useMemo(() => {
    try {
      return JSON.parse(atob(props.encodedVideoInformation));
    } catch {
      return {
        videoId: undefined,
        skips: [],
        videoBounds: undefined,
      }
    }
  }, [props.encodedVideoInformation]);

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    // @ts-ignore
    setPlayer(event.target);
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    setPlayerState(event.data);
  }, []);

  const onToggleFullscreen = useCallback(async () => {
    if (playerContainer.current) {
      // eslint-disable-next-line
      // @ts-ignore
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            // eslint-disable-next-line
            // @ts-ignore
          } else if (document.webkitExitFullscreen) {
            alert('webkitExitFullscreen');
            // eslint-disable-next-line
            // @ts-ignore
            document.webkitExitFullscreen();
          }
          setIsFullscreen(false);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          if (playerContainer.current.requestFullscreen) {
            await playerContainer.current.requestFullscreen();
            setIsFullscreen(true);

            // eslint-disable-next-line
            // @ts-ignore
          } else if (playerContainer.current.webkitRequestFullscreen) {

            // eslint-disable-next-line
            // @ts-ignore
            playerContainer.current.webkitRequestFullscreen();
            setIsFullscreen(true);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, []);

  const playVideo = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pauseVideo = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    YT.ready(() => {
      if (!videoId) {
        return;
      }

      new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId,
        host: 'https://www.youtube-nocookie.com',
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
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

  const isPlaying = !!player && playerState === YT.PlayerState.PLAYING;

  return (
    <div ref={playerContainer} className='flex align-center justify-center overflow-hidden bg-black relative h-full'>
      <div className='h-full w-full relative overflow-hidden'>
        <div id='player' />
      </div>

      <div className='absolute top-0 h-full w-full flex flex-col'>
        <div className='flex items-center justify-center flex-auto'>
          {!isPlaying && (
            <button className='mt-[51px] w-[70px] h-[48px] rounded-[10px] bg-[#BC335B] flex items-center justify-center' onClick={playVideo}>
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

        <VideoControls
          player={player}
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          skips={skips}
          videoBounds={videoBounds}
          onPlayVideo={playVideo}
          onPauseVideo={pauseVideo}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </div>
  );
};

export default YTPlayer;
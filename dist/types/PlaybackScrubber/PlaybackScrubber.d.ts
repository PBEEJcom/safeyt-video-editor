/// <reference types="youtube" />
/// <reference types="react" />
import { TimeSegment } from '../Utils/YouTube';
import './PlaybackScrubber.css';
export interface VideoControlsProps {
    isFullscreen: boolean;
    duration: number;
    startingOffset: number;
    player?: YT.Player;
    skips: TimeSegment[];
    playerState: YT.PlayerState;
    onToggleFullscreen(): void;
}
declare const EditorControlBar: (props: VideoControlsProps) => JSX.Element;
export default EditorControlBar;

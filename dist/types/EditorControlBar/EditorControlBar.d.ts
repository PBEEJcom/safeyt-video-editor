/// <reference types="youtube" />
/// <reference types="react" />
import { TimeSegment } from '../Utils/YouTube';
import './EditorControlBar.css';
export interface VideoControlsProps {
    player?: YT.Player;
    skips: TimeSegment[];
    playerState: YT.PlayerState;
    handleEditSkip: (index: number, isEditingBounds: boolean) => void;
}
declare const EditorControlBar: (props: VideoControlsProps) => JSX.Element;
export default EditorControlBar;

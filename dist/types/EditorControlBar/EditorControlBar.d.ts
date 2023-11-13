/// <reference types="youtube" />
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
import './EditorControlBar.css';
export interface VideoControlsProps {
    player?: YT.Player;
    skips: TimeSegment[];
    playerState: YT.PlayerState;
    handleEditSkip: (index: number) => void;
}
declare const EditorControlBar: (props: VideoControlsProps) => React.JSX.Element;
export default EditorControlBar;

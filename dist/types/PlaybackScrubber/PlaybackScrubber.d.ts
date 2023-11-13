/// <reference types="youtube" />
import { TimeSegment } from '../Utils/YouTube';
import React from 'react';
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
declare const EditorControlBar: (props: VideoControlsProps) => React.JSX.Element;
export default EditorControlBar;

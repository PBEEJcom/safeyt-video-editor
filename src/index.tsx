import React from 'react';
import ReactDOM from 'react-dom';
import EditorControlBar from './EditorControlBar/EditorControlBar';

ReactDOM.render(
    <React.StrictMode>
      <EditorControlBar isPlaying={false} isFullscreen={false} onPlayVideo={function (): void {
            throw new Error('Function not implemented.');
        } } onPauseVideo={function (): void {
            throw new Error('Function not implemented.');
        } } onToggleFullscreen={function (): void {
            throw new Error('Function not implemented.');
        } } />
    </React.StrictMode>,
    document.getElementById('root')
  );

export { default as EditorControlBar } from './EditorControlBar/EditorControlBar'

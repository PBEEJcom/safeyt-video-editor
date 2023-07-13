import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';
import SafeYTVideoEditor from './SafeYTVideoEditor/SafeYTVideoEditor';


ReactDOM.render(
    <React.StrictMode>
        <script src="https://apis.google.com/js/api.js"></script>
        <script src="https://www.youtube.com/iframe_api"></script>
      <SafeYTVideoEditor open={true} youTubeLink={'https://youtu.be/4EZfXqcUg6E'} onClose={function (value: string): void {
            throw new Error('Function not implemented.');
        } } />
    </React.StrictMode>,
    document.getElementById('root')
  );

export { default as SafeYTVideoEditor } from './SafeYTVideoEditor/SafeYTVideoEditor'

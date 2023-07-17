import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';
import SafeYTVideoEditor from './SafeYTVideoEditor/SafeYTVideoEditor';


ReactDOM.render(
    <React.StrictMode>
      <SafeYTVideoEditor open={true} youTubeLink={'https://youtu.be/4EZfXqcUg6E'} onClose={function (value: string): void {
            throw new Error('Function not implemented.');
        } } />
    </React.StrictMode>,
    document.getElementById('root')
  );

export { default as SafeYTVideoEditor } from './SafeYTVideoEditor/SafeYTVideoEditor'

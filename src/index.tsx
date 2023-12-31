import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';
import App from './App';

ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );

export { default as SafeYTVideoEditor } from './SafeYTVideoEditor/SafeYTVideoEditor'
export { default as YouTube } from './Utils/YouTube'
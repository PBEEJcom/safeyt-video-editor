import React, { useState } from 'react';
import './App.css';
import SafeYTVideoEditor from './SafeYTVideoEditor/SafeYTVideoEditor';
import { TextField } from '@mui/material';

function App() {
  const [link, setLink] = useState<string>('https://safeyt.pbeej.com/embed/eyJ2aWRlb0lkIjoicER5ZWNlOENRRjgiLCJza2lwcyI6W3sic3RhcnQiOiIxOTYiLCJlbmQiOiIyMDIifSx7InN0YXJ0IjoiMzAzIiwiZW5kIjoiMzA0In0seyJzdGFydCI6IjM4NiIsImVuZCI6IjM4OSJ9LHsic3RhcnQiOiI0NzMiLCJlbmQiOiI0NzYifV0sInZpZGVvQm91bmRzIjp7ImVuZCI6IjUwNSJ9fQ==');

  const handleLinkChange = (event: any) => {
    setLink(event.target.value);
  }

  return (
    <div className="app">
      <TextField
        placeholder="YouTube or SafeYT Link"
        value={link}
        onChange={handleLinkChange}
      />
      <SafeYTVideoEditor open={true} link={link} onClose={function (value: string): void {
            throw new Error('Function not implemented.');
        } } />

      <h3><b>Debug Links</b></h3>
      <ul>
        <li> https://youtu.be/4EZfXqcUg6E </li>
        <li> https://safeyt.pbeej.com/embed/eyJ2aWRlb0lkIjoicER5ZWNlOENRRjgiLCJza2lwcyI6W3sic3RhcnQiOiIxOTYiLCJlbmQiOiIyMDIifSx7InN0YXJ0IjoiMzAzIiwiZW5kIjoiMzA0In0seyJzdGFydCI6IjM4NiIsImVuZCI6IjM4OSJ9LHsic3RhcnQiOiI0NzMiLCJlbmQiOiI0NzYifV0sInZpZGVvQm91bmRzIjp7ImVuZCI6IjUwNSJ9fQ== </li>
        <li> https://safeyt.pbeej.com/embed/eyJ2aWRlb0lkIjoiRmN0UnBhbGVSRmMiLCJza2lwcyI6W119 </li>
      </ul>
    </div>
  );
}

export default App;

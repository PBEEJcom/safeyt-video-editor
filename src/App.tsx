import React, { useState } from 'react';
import './App.css';
import SafeYTVideoEditor from './SafeYTVideoEditor/SafeYTVideoEditor';
import { TextField } from '@mui/material';

function App() {
  const [link, setLink] = useState<string>('');
  const [viewLink, setViewLink] = useState<string>('');

  const handleLinkChange = (event: any) => {
    setLink(event.target.value);
  }

  const handleViewLinkChange = (event: any) => {
    setViewLink(event.target.value);
  }

  return (
    <div className="app h-[500px]">
      <TextField
        placeholder="YouTube or SafeYT Link"
        value={link}
        onChange={handleLinkChange}
      />
      <SafeYTVideoEditor height={200} width={400} isEditMode={true} link={link} onSafeYTLinkChange={(link: string) => console.log(link)} />


      <TextField
        placeholder="YouTube or SafeYT Link"
        value={viewLink}
        onChange={handleViewLinkChange}
      />
      <SafeYTVideoEditor height={300} width={500} isEditMode={false} link={viewLink} onSafeYTLinkChange={(link: string) => console.log(link)} />
    </div>
  );
}

export default App;

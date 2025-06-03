import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || 'Upload complete!');
    } catch (err) {
      setUploadStatus('Upload failed.');
    }
  };

  return (
    <div>
      <Head>
        <title>CV-to-Dynamic-Website Generator</title>
      </Head>
      <main>
        <h1>Welcome to the CV-to-Dynamic-Website Generator</h1>
        <p>Upload your CV and generate a modern, dynamic website!</p>
        <form onSubmit={handleUpload}>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          <button type="submit">Upload CV</button>
        </form>
        <p>{uploadStatus}</p>
      </main>
    </div>
  );
}

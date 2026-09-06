import { useState, type ChangeEvent } from 'react';
import { PdfViewer } from '@pdf-file-tools/react-viewer';
import './App.css';

function App() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfTitle(file.name);
    }
  };

  return (
    <div className="playground-container">
      <header className="playground-header">
        <h1>pdf-tools Playground</h1>
        <p>Test the @pdf-file-tools/react-viewer locally</p>
      </header>

      <main className="playground-main">
        {!pdfUrl ? (
          <div className="upload-section">
            <h2>Upload a PDF</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>
        ) : (
          <div className="viewer-section">
            <div className="viewer-toolbar">
              <button onClick={() => setPdfUrl(null)} className="btn-close">
                Close Document
              </button>
            </div>
            <div className="viewer-container">
              <PdfViewer url={pdfUrl} title={pdfTitle} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

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
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <img src="/logo.svg" alt="PDF Tools Logo" className="logo" />
            <h1>pdf-tools</h1>
          </div>
          <nav className="header-links">
            <a href="https://pdf-tools-docs.vercel.app/" target="_blank" rel="noreferrer">Docs</a>
            <a href="https://github.com/hamzarihani/pdf-tools" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="playground-main">
        {!pdfUrl ? (
          <div className="upload-section">
            <h2>PDF Playground</h2>
            <p>Select any PDF file from your device to instantly preview it using the @pdf-file-tools/react-viewer component.</p>
            <div className="file-input-wrapper">
              <button className="btn btn-primary" style={{ position:'relative' }}>Choose PDF File</button>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        ) : (
          <div className="viewer-section">
            <div className="viewer-toolbar">
              <button onClick={() => setPdfUrl(null)} className="btn btn-close">
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

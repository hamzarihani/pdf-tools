import './App.css'

function App() {
  return (
    <>
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <img src="/logo.svg" alt="PDF Tools Logo" className="logo" />
            <h1>pdf-tools</h1>
          </div>
          <nav className="header-links">
            <a href="https://github.com/hamzarihani/pdf-tools" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.npmjs.com/package/@pdf-file-tools/react-viewer" target="_blank" rel="noreferrer">npm</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h2>The Ultimate PDF Ecosystem</h2>
          <p>A suite of modern, highly customizable PDF tools designed for React and TypeScript developers. Build rich document experiences effortlessly.</p>
          <div className="hero-buttons">
            <a href="#react-viewer" className="btn btn-primary">Get Started</a>
            <a href="https://github.com/hamzarihani/pdf-tools" target="_blank" rel="noreferrer" className="btn btn-secondary">View Source</a>
          </div>
        </section>

        <section className="grid" id="react-viewer">
          <div className="card">
            <h3>@pdf-file-tools/react-viewer <span className="badge">v1.0.2</span></h3>
            <p>A highly customizable, feature-rich React component for rendering and interacting with PDF documents.</p>

            <h4 style={{ color: 'var(--text-color)', marginTop: '2rem' }}>Quick Install</h4>
            <pre className="code-block">
              <code>npm i @pdf-file-tools/react-viewer pdfjs-dist</code>
            </pre>

            <h4 style={{ color: 'var(--text-color)', marginTop: '2rem' }}>Basic Usage</h4>
            <pre className="code-block">
              <code>
{`import { PdfViewer } from '@pdf-file-tools/react-viewer';

export default function App() {
  return (
    <div style={{ height: '800px' }}>
      <PdfViewer url="/sample.pdf" title="Sample" />
    </div>
  );
}`}
              </code>
            </pre>
          </div>

          <div className="card">
            <h3>Ecosystem Roadmap</h3>
            <p>We are actively building out modular tools for every PDF need, so you only bundle what you use.</p>
            <ul className="feature-list">
              <li>react-viewer <span>Available</span></li>
              <li>pdf-merger <span>In Development</span></li>
              <li>pdf-splitter <span>Planned</span></li>
              <li>react-annotator <span>Planned</span></li>
              <li>pdf-extractor <span>Planned</span></li>
            </ul>
          </div>
        </section>
      </main>
    </>
  )
}

export default App

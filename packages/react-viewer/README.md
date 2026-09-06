# @pdf-file-tools/react-viewer

A professional, responsive, and customizable PDF viewer for React applications, built on top of `pdfjs-dist`.

**Repository:** [github.com/hamzarihani/pdf-tools](https://github.com/hamzarihani/pdf-tools)

## Features
- Search text within the PDF
- Zoom in/out, Page Fit
- Light/Dark mode
- Fullscreen support
- Document metadata viewer
- Print and Download support
- Fully typed (TypeScript)

## Installation

```bash
npm install @pdf-file-tools/react-viewer pdfjs-dist
```

*Note: `pdfjs-dist` is a required peer dependency.*

## Usage

```tsx
import React from 'react';
import { PdfViewer } from '@pdf-tools/react-viewer';

const App = () => {
  return (
    <div style={{ height: '800px', width: '100%' }}>
      <PdfViewer 
        url="https://example.com/sample.pdf" 
        title="Sample Document" 
      />
    </div>
  );
}

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | **Required** | The URL of the PDF document. |
| `title` | `string` | **Required** | The title of the document (used in download and metadata). |
| `workerUrl` | `string` | `https://cdnjs...` | Custom URL for the PDF.js worker. Highly recommended for production. |
| `dictionary` | `Partial<PdfViewerDictionary>` | `{}` | Override translation strings (e.g. `{ search: "Buscar" }`). |
| `isRtl` | `boolean` | `false` | Enable Right-to-Left (RTL) mode. |

### Setting up the PDF.js Worker

For optimal performance and stability across environments, provide the worker URL explicitly:

```tsx
<PdfViewer 
  url="doc.pdf" 
  title="Doc"
  workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`}
/>
```

## Support

If you find this component useful, please consider giving the [pdf-tools repository](https://github.com/hamzarihani/pdf-tools) a ⭐️ on GitHub! It helps the project grow and reach more developers.

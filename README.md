# pdf-tools

An open-source ecosystem of reusable PDF tools for JavaScript/TypeScript and React.

## Features

- **Modular Packages**: Use only what you need.
- **Modern Tech Stack**: React, TypeScript, and Vite.
- **Active Development**: Growing ecosystem of PDF-related tools.

## Available Packages

- [`@pdf-file-tools/react-viewer`](./packages/react-viewer) - A highly customizable React component for rendering PDFs.
- *(More coming soon: pdf-merger, pdf-splitter, etc.)*

## Available Applications

- **[Docs](./apps/docs)**: Documentation website for the PDF Tools ecosystem.
- **[Playground](./apps/playground)**: Interactive demo application for testing and showcasing the PDF packages.

## Quick Start (react-viewer)

### Installation

```bash
npm install @pdf-file-tools/react-viewer pdfjs-dist
```

### Example Usage

```tsx
import React from 'react';
import { PdfViewer } from '@pdf-file-tools/react-viewer';

const App = () => {
  return (
    <div style={{ height: '100vh' }}>
      <PdfViewer url="path/to/your/document.pdf" />
    </div>
  );
};

export default App;
```

## Development Setup

This project uses npm workspaces.

### Initialization

```bash
# Clone the repository
git clone https://github.com/your-username/pdf-tools.git
cd pdf-tools

# Install dependencies for all packages and apps
npm install
```

### Building Packages

To build the `@pdf-file-tools/react-viewer` package:

```bash
npm run build:packages
# or build everything
npm run build
```

### Running Applications Locally

**Docs App:**
```bash
npm run dev:docs
```

**Playground App:**
```bash
npm run dev:playground
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

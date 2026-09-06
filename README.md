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
## Custom translation / i18n

`PdfViewer` supports runtime translation via the `dictionary` and `dictionaryMap` props.

```tsx
import { PdfViewer } from '@pdf-file-tools/react-viewer';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const pdfViewerDict = {
  search: t('rechercher'),
  firstPage: t('premiere-page'),
  lastPage: t('derniere-page'),
  // …add any keys you need
};

const App = () => (
  <PdfViewer
    url="/sample.pdf"
    title={t('My PDF')}
    dictionary={pdfViewerDict}
  />
);
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

## Support

If you find this project useful, please consider giving it a ⭐️ on GitHub! It helps the project grow and reach more developers.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

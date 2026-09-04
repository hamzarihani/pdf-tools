import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ZoomIn, ZoomOut, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Moon, Sun, Info, Download, Printer, Maximize, Minimize, MoreVertical, Loader2, RotateCw, RotateCcw, PanelLeft, BookOpen, FileText } from './icons';
import * as pdfjsLib from 'pdfjs-dist';
import './styles.css';

export interface PdfViewerDictionary {
  search: string;
  searchPdf: string;
  firstPage: string;
  lastPage: string;
  lightMode: string;
  darkMode: string;
  rotateCcw: string;
  rotateCw: string;
  documentInfo: string;
  download: string;
  print: string;
  fileName: string;
  pages: string;
  author: string;
  creator: string;
  created: string;
  loadingDocument: string;
}

const defaultDictionary: PdfViewerDictionary = {
  search: 'Search',
  searchPdf: 'Search...',
  firstPage: 'First Page',
  lastPage: 'Last Page',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  rotateCcw: 'Rotate Counterclockwise',
  rotateCw: 'Rotate Clockwise',
  documentInfo: 'Document Info',
  download: 'Download',
  print: 'Print',
  fileName: 'File Name',
  pages: 'Pages',
  author: 'Author',
  creator: 'Creator',
  created: 'Created',
  loadingDocument: 'Loading Document...'
};

interface PdfPageRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  zoom: number | 'auto';
  activeSearch: string;
  wrapperWidth: number;
  onRenderComplete?: () => void;
  rotation: number;
  viewMode: 'single' | 'dual';
}

const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  activeSearch,
  wrapperWidth,
  rotation,
  viewMode,
  onRenderComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [viewport100, setViewport100] = useState<any>(null);
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);
  const renderTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '800px 0px', threshold: 0 }
    );
    
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    pdfDoc.getPage(pageNumber).then(pageObj => {
      if (!active) return;
      const baseRotation = pageObj.rotate || 0;
      const finalRotation = (baseRotation + rotation) % 360;
      setViewport100(pageObj.getViewport({ scale: 1.0, rotation: finalRotation }));
    });
    return () => { active = false; };
  }, [pdfDoc, pageNumber, rotation]);

  let currentTargetWidth: number | undefined = undefined;
  let currentTargetHeight: number | undefined = undefined;

  if (viewport100) {
    if (zoom === 'auto') {
      const containerWidth = wrapperWidth || 800;
      let availableWidth = containerWidth - 40;
      if (viewMode === 'dual') {
        availableWidth = (containerWidth - 60) / 2;
      }
      currentTargetWidth = availableWidth;
    } else {
      currentTargetWidth = viewport100.width * (zoom / 100);
    }
    currentTargetHeight = currentTargetWidth * (viewport100.height / viewport100.width);
  }

  useEffect(() => {
    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    
    renderTimeoutRef.current = setTimeout(async () => {
      if (!isVisible || !canvasRef.current || !viewport100) return;
      
      try {
        const pageObj = await pdfDoc.getPage(pageNumber);
        const baseRotation = pageObj.rotate || 0;
        const finalRotation = (baseRotation + rotation) % 360;
        
        let scale = 1.0;
        if (zoom === 'auto') {
          const containerWidth = wrapperWidth || 800;
          let availableWidth = containerWidth - 40;
          if (viewMode === 'dual') {
            availableWidth = (containerWidth - 60) / 2;
          }
          scale = availableWidth / viewport100.width;
        } else {
          scale = zoom / 100;
        }
        
        const viewport = pageObj.getViewport({ scale, rotation: finalRotation });
        
        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = viewport.width;
        hiddenCanvas.height = viewport.height;
        const hiddenContext = hiddenCanvas.getContext('2d');
        if (!hiddenContext) return;
        
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
        
        const renderTask = pageObj.render({
          canvasContext: hiddenContext,
          viewport: viewport,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        context?.drawImage(hiddenCanvas, 0, 0);
        
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.width = `${viewport.width}px`;
          textLayerRef.current.style.height = `${viewport.height}px`;
        }

        if (onRenderComplete) {
          onRenderComplete();
        }

        if (activeSearch && textLayerRef.current) {
          const textContent = await pageObj.getTextContent();
          const searchLower = activeSearch.toLowerCase();
          
          textContent.items.forEach((item: any) => {
            if (item.str) {
              const itemStrLower = item.str.toLowerCase();
              let startIndex = 0;
              let matchIndex = itemStrLower.indexOf(searchLower, startIndex);

              while (matchIndex !== -1) {
                const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
                const fullWidth = item.width * viewport.scale;
                const height = Math.abs(item.transform[3]) * viewport.scale * 1.2; 
                
                const charWidth = fullWidth / item.str.length;
                const matchOffsetLeft = matchIndex * charWidth;
                const matchWidth = searchLower.length * charWidth;
                
                const div = document.createElement('div');
                div.className = 'pdf-search-highlight';
                div.style.left = `${x + matchOffsetLeft}px`;
                div.style.top = `${y - (height * 0.8)}px`; 
                div.style.width = `${matchWidth}px`;
                div.style.height = `${height}px`;
                
                textLayerRef.current?.appendChild(div);

                startIndex = matchIndex + searchLower.length;
                matchIndex = itemStrLower.indexOf(searchLower, startIndex);
              }
            }
          });
        }
        
        setRenderedWidth(viewport.width);
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      }
    }, 150);
    
    return () => clearTimeout(renderTimeoutRef.current);
  }, [pdfDoc, pageNumber, zoom, activeSearch, isVisible, wrapperWidth, rotation, viewMode, onRenderComplete, viewport100]);

  const isScaling = currentTargetWidth && renderedWidth && Math.abs(currentTargetWidth - renderedWidth) > 1;

  return (
    <div 
      ref={containerRef} 
      id={`pdf-page-${pageNumber}`} 
      className="pdf-page-container" 
      data-page-number={pageNumber}
      style={{
        width: currentTargetWidth ? `${currentTargetWidth}px` : undefined,
        height: currentTargetHeight ? `${currentTargetHeight}px` : undefined
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="pdf-canvas" 
        style={{ width: '100%', height: '100%' }}
      />
      <div 
        ref={textLayerRef} 
        className="pdf-text-layer" 
        style={{ display: isScaling ? 'none' : 'block' }}
      />
    </div>
  );
};

interface PdfThumbnailRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  rotation: number;
  isActive: boolean;
  onClick: () => void;
}

const PdfThumbnailRenderer: React.FC<PdfThumbnailRendererProps> = ({
  pdfDoc,
  pageNumber,
  rotation,
  isActive,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '400px 0px', threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const renderPage = useCallback(async () => {
    if (!isVisible || !canvasRef.current) return;
    try {
      const pageObj = await pdfDoc.getPage(pageNumber);
      const baseRotation = pageObj.rotate || 0;
      const finalRotation = (baseRotation + rotation) % 360;
      
      const viewport100 = pageObj.getViewport({ scale: 1.0, rotation: finalRotation });
      const targetWidth = 140;
      const scale = targetWidth / viewport100.width;
      
      const viewport = pageObj.getViewport({ scale, rotation: finalRotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      
      const renderTask = pageObj.render({
        canvasContext: context,
        viewport: viewport,
      });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Thumbnail render error:', err);
      }
    }
  }, [pdfDoc, pageNumber, isVisible, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return (
    <div 
      ref={containerRef} 
      className={`pdf-thumbnail-container ${isActive ? 'pdf-thumbnail-active' : ''}`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="pdf-thumbnail-canvas" />
      <div className="pdf-thumbnail-page-number">{pageNumber}</div>
    </div>
  );
};

export interface PdfViewerProps {
  url: string;
  title: string;
  workerUrl?: string;
  dictionary?: Partial<PdfViewerDictionary>;
  isRtl?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ 
  url, 
  title, 
  workerUrl,
  dictionary: customDict,
  isRtl = false
}) => {
  const dict = { ...defaultDictionary, ...customDict };

  if (workerUrl) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  } else if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const isV4Plus = parseInt(pdfjsLib.version.split('.')[0], 10) >= 4;
    const ext = isV4Plus ? 'mjs' : 'js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.${ext}`;
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState<number | 'auto'>('auto');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [wrapperWidth, setWrapperWidth] = useState(800);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [docMetadata, setDocMetadata] = useState<any>(null);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [rotation, setRotation] = useState(0);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const themeClass = isDark ? 'pdf-theme-dark' : 'pdf-theme-light';

  const [zoomDropdownStyle, setZoomDropdownStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const [moreMenuStyle, setMoreMenuStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    const updatePositions = () => {
      if (showZoomDropdown && zoomDropdownRef.current) {
        const rect = zoomDropdownRef.current.getBoundingClientRect();
        setZoomDropdownStyle({ visibility: 'visible', top: rect.bottom + 4, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' });
      }
      if (showMoreMenu && moreMenuRef.current) {
        const rect = moreMenuRef.current.getBoundingClientRect();
        setMoreMenuStyle({ visibility: 'visible', top: rect.bottom + 4, left: rect.right, transform: 'translateX(-100%)' });
      }
    };
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [showZoomDropdown, showMoreMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showZoomDropdown && zoomDropdownRef.current && !zoomDropdownRef.current.contains(event.target as Node)) {
        const isClickInPortal = (event.target as Element).closest('.pdf-zoom-dropdown');
        if (!isClickInPortal) setShowZoomDropdown(false);
      }
      if (showMoreMenu && moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        const isClickInPortal = (event.target as Element).closest('.pdf-more-menu');
        if (!isClickInPortal) setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showZoomDropdown, showMoreMenu]);

  const handleZoomIn = () => setZoom(prev => typeof prev === 'number' ? Math.min(prev + 25, 300) : 125);
  const handleZoomOut = () => setZoom(prev => typeof prev === 'number' ? Math.max(prev - 25, 25) : 75);

  const scrollToPage = (pageNum: number) => {
    setPage(pageNum);
    const element = document.getElementById(`pdf-page-${pageNum}`);
    if (element && wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: element.offsetTop - 16,
        behavior: 'smooth'
      });
    }
  };

  const handleNextPage = () => scrollToPage(Math.min(page + 1, totalPages));
  const handlePrevPage = () => scrollToPage(Math.max(page - 1, 1));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handlePrint = () => {
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleRotateCw = () => setRotation(r => (r + 90) % 360);
  const handleRotateCcw = () => setRotation(r => (r + 270) % 360);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = title || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    let active = true;
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (active) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setPage(1);

          try {
            const meta = await pdf.getMetadata();
            if (meta && meta.info) {
              setDocMetadata(meta.info);
            }
          } catch (e) {
            console.error('Failed to load metadata', e);
          }
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
      }
    };
    loadPdf();
    return () => { active = false; };
  }, [url]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWrapperWidth(entry.contentRect.width);
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !pdfDoc) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '1');
            setPage(pageNum);
          }
        });
      },
      { 
        root: wrapperRef.current,
        threshold: 0.4 
      }
    );
    
    const timer = setTimeout(() => {
      if (wrapperRef.current) {
        const pageNodes = wrapperRef.current.querySelectorAll('[data-page-number]');
        pageNodes.forEach(node => observer.observe(node));
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pdfDoc, totalPages]);

  return (
    <div ref={containerRef} className={`pdf-viewer ${themeClass}`}>
      <div className="pdf-header">
        <div className="pdf-header-left">
          <button 
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`pdf-btn ${showThumbnails ? 'pdf-btn-active' : ''}`}
            title="Toggle Thumbnails"
          >
            <PanelLeft size={18} />
          </button>
          <div className="pdf-divider"></div>
          <div className="pdf-search-container">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`pdf-btn ${showSearch ? 'pdf-btn-active' : ''}`} 
              title={dict.search}
            >
              <Search size={18} />
            </button>
            
            {showSearch && (
              <form onSubmit={handleSearch} className="pdf-search-form">
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={dict.searchPdf}
                  className="pdf-search-input"
                  autoFocus
                />
              </form>
            )}
          </div>
          
          <div className="pdf-pagination">
            <button 
              onClick={isRtl ? handleNextPage : handlePrevPage} 
              className="pdf-btn"
              disabled={page <= 1}
            >
              <ChevronUp size={18} />
            </button>
            
            <div className="pdf-page-input-container">
              <input 
                type="number" 
                value={page}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0 && val <= totalPages) {
                    scrollToPage(val);
                  }
                }}
                className="pdf-page-input"
              />
            </div>
            
            <span className="pdf-page-total">/ {totalPages}</span>
            
            <button 
              onClick={isRtl ? handlePrevPage : handleNextPage} 
              className="pdf-btn"
              disabled={page >= totalPages}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div className="pdf-header-center">
          <button onClick={handleZoomOut} className="pdf-btn">
            <ZoomOut size={18} />
          </button>
          
          <div className="pdf-zoom-container" ref={zoomDropdownRef}>
            <button
              onClick={() => setShowZoomDropdown(!showZoomDropdown)}
              className="pdf-btn pdf-zoom-btn"
            >
              {zoom === 'auto' ? 'Page Fit' : `${zoom}%`}
              <ChevronDown size={14} className="pdf-zoom-icon" />
            </button>
            {showZoomDropdown && createPortal(
              <div 
                style={{ 
                  position: 'fixed', 
                  zIndex: 9999, 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  ...zoomDropdownStyle 
                }}
              >
                <div 
                  className={`pdf-zoom-dropdown ${themeClass}`} 
                  style={{ position: 'relative', top: 0, left: 0, transform: 'none', margin: 0 }}
                >
                  {[
                  { value: 'auto', label: 'Page Fit' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                  { value: 125, label: '125%' },
                  { value: 150, label: '150%' },
                  { value: 200, label: '200%' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setZoom(option.value as any);
                      setShowZoomDropdown(false);
                    }}
                    className={`pdf-zoom-option ${zoom === option.value ? 'pdf-zoom-option-active' : ''}`}
                  >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
          </div>
          
          <button onClick={handleZoomIn} className="pdf-btn">
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="pdf-header-right">
          <div className="pdf-desktop-actions">
            <button onClick={() => setShowDocInfo(true)} className="pdf-btn" title="Document Info"><Info size={18} /></button>
            <button onClick={handleDownload} className="pdf-btn" title="Download"><Download size={18} /></button>
            <button onClick={handlePrint} className="pdf-btn" title="Print"><Printer size={18} /></button>
            <button onClick={handleFullscreen} className="pdf-btn" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <div className="pdf-divider"></div>
          </div>

          <div className="pdf-more-menu-container" ref={moreMenuRef}>
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="pdf-btn"
            >
              <MoreVertical size={18} />
            </button>

            {showMoreMenu && createPortal(
              <div 
                style={{ 
                  position: 'fixed', 
                  zIndex: 9999, 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  ...moreMenuStyle 
                }}
              >
                <div 
                  className={`pdf-more-menu ${themeClass}`}
                  style={{ position: 'relative', top: 0, left: 0, right: 'auto', transform: 'none', margin: 0 }}
                >
                  <button onClick={() => { scrollToPage(1); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  <ChevronsUp size={16} /> {dict.firstPage}
                </button>
                <button onClick={() => { scrollToPage(totalPages); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  <ChevronsDown size={16} /> {dict.lastPage}
                </button>
                <button onClick={() => { setIsDark(!isDark); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? dict.lightMode : dict.darkMode}
                </button>
                <button onClick={() => { setViewMode(viewMode === 'single' ? 'dual' : 'single'); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  {viewMode === 'single' ? <BookOpen size={16} /> : <FileText size={16} />} {viewMode === 'single' ? 'Dual Page View' : 'Single Page View'}
                </button>
                <button onClick={() => { handleRotateCcw(); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  <RotateCcw size={16} /> {dict.rotateCcw}
                </button>
                <button onClick={() => { handleRotateCw(); setShowMoreMenu(false); }} className="pdf-more-menu-item">
                  <RotateCw size={16} /> {dict.rotateCw}
                </button>
                <button onClick={() => { setShowDocInfo(true); setShowMoreMenu(false); }} className="pdf-more-menu-item pdf-mobile-only">
                  <Info size={16} /> {dict.documentInfo}
                </button>
                <button onClick={() => { handleDownload(); setShowMoreMenu(false); }} className="pdf-more-menu-item pdf-mobile-only">
                  <Download size={16} /> {dict.download}
                </button>
                <button onClick={() => { handlePrint(); setShowMoreMenu(false); }} className="pdf-more-menu-item pdf-mobile-only">
                  <Printer size={16} /> {dict.print}
                </button>
                  <button onClick={() => { handleFullscreen(); setShowMoreMenu(false); }} className="pdf-more-menu-item pdf-mobile-only">
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>

      <div className="pdf-body">
        <div className={`pdf-thumbnails-sidebar ${showThumbnails ? 'pdf-thumbnails-sidebar-open' : ''}`}>
          {pdfDoc && Array.from({ length: totalPages }, (_, i) => (
            <PdfThumbnailRenderer
              key={`thumb-${i + 1}`}
              pdfDoc={pdfDoc}
              pageNumber={i + 1}
              rotation={rotation}
              isActive={page === i + 1}
              onClick={() => scrollToPage(i + 1)}
            />
          ))}
        </div>
        <div ref={wrapperRef} className="pdf-content-wrapper">
          {isLoading && (
          <div className="pdf-loading-overlay">
            <Loader2 className="pdf-spinner" />
            <p className="pdf-loading-text">{dict.loadingDocument}</p>
          </div>
        )}
        <div className={`pdf-pages-container ${viewMode === 'dual' ? 'pdf-pages-container-dual' : ''}`}>
          {pdfDoc && Array.from({ length: totalPages }, (_, i) => (
            <PdfPageRenderer
              key={i + 1}
              pdfDoc={pdfDoc}
              pageNumber={i + 1}
              zoom={zoom}
              activeSearch={activeSearch}
              wrapperWidth={wrapperWidth}
              rotation={rotation}
              viewMode={viewMode}
              onRenderComplete={i === 0 ? () => setIsLoading(false) : undefined}
            />
          ))}
        </div>
      </div>
      </div>
      
      <div 
        className={`pdf-backdrop ${showDocInfo ? 'pdf-backdrop-visible' : ''}`}
        onClick={() => setShowDocInfo(false)}
      />
      <div className={`pdf-side-panel ${showDocInfo ? 'pdf-side-panel-open' : ''}`}>
        <div className="pdf-side-panel-header">
          <h3>{dict.documentInfo}</h3>
          <button onClick={() => setShowDocInfo(false)} className="pdf-btn">
            ✕
          </button>
        </div>
        <div className="pdf-info-list">
          <div className="pdf-info-item">
            <span className="pdf-info-label">{dict.fileName}</span>
            <span className="pdf-info-value">{title}</span>
          </div>
          <div className="pdf-info-item">
            <span className="pdf-info-label">{dict.pages}</span>
            <span className="pdf-info-value">{totalPages}</span>
          </div>
          {docMetadata?.Author && (
            <div className="pdf-info-item">
              <span className="pdf-info-label">{dict.author}</span>
              <span className="pdf-info-value">{docMetadata.Author}</span>
            </div>
          )}
          {docMetadata?.Creator && (
            <div className="pdf-info-item">
              <span className="pdf-info-label">{dict.creator}</span>
              <span className="pdf-info-value">{docMetadata.Creator}</span>
            </div>
          )}
          {docMetadata?.CreationDate && (
            <div className="pdf-info-item">
              <span className="pdf-info-label">{dict.created}</span>
              <span className="pdf-info-value">{docMetadata.CreationDate.replace('D:', '').substring(0, 14)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

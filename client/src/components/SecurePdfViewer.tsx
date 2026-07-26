import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, AlertCircle, ShieldCheck } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function SecurePdfViewer({ url, title, onClose }: SecurePdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Prevent right click on the entire component
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContext);
    return () => document.removeEventListener('contextmenu', handleContext);
  }, []);

  // Prevent keyboard shortcuts (Ctrl+P, Ctrl+S, etc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError() {
    setError(true);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground uppercase tracking-wider font-bold">Secure View</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {numPages && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1 mr-4">
              <button 
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                className="p-1 hover:bg-background rounded disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium w-20 text-center">
                Page {pageNumber} of {numPages}
              </span>
              <button 
                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                disabled={pageNumber >= numPages}
                className="p-1 hover:bg-background rounded disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(3, s + 0.2))}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div 
        className="flex-1 overflow-auto bg-muted/30 p-8 select-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <div className="relative shadow-2xl rounded-sm overflow-hidden mx-auto w-max flex justify-center items-center bg-card min-h-[50vh]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-[600px] bg-card text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
              <p className="text-sm">Failed to load secure document.</p>
            </div>
          ) : (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-full min-h-[600px] w-[400px]">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              }
              error={
                 <div className="flex items-center justify-center h-full min-h-[600px] w-[400px] text-destructive flex-col">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <span className="text-sm">Could not load PDF</span>
                 </div>
              }
            >
              {!loading && (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="bg-white"
                />
              )}
            </Document>
          )}

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  url: string;
  title?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function PDFViewer({ url, title, currentPage = 1, onPageChange, className }: PDFViewerProps) {
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Using iframe for PDF viewing (browser-native, no extra dependencies)
  const pdfUrl = `${url}#page=${page}&zoom=${zoom}`;

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              value={page}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-12 text-center bg-background border rounded px-1 py-0.5"
              min={1}
              max={totalPages}
            />
            <span className="text-muted-foreground">/ {totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm w-12 text-center">{zoom}%</span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 relative overflow-auto bg-muted/30">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          src={pdfUrl}
          className="w-full h-full min-h-[600px]"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          onLoad={() => setIsLoading(false)}
          title={title || 'PDF Viewer'}
        />
      </div>
    </div>
  );
}

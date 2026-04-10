'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface SlideViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  slideImageUrls?: string[];
  pdfUrl?: string;
  postContent?: string;
  hashtags?: string[];
}

export default function SlideViewer({
  open,
  onOpenChange,
  title,
  slideImageUrls,
  pdfUrl,
  postContent,
  hashtags,
}: SlideViewerProps) {
  const hasSlides = slideImageUrls && slideImageUrls.length > 0;
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (hasSlides) setCurrentSlide((prev) => Math.min(prev + 1, slideImageUrls!.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-base font-semibold truncate max-w-[70%]">
              {title}
            </DialogTitle>
            {pdfUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                asChild
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  PDF
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        {hasSlides ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Slide display */}
            <div className="flex-1 flex items-center justify-center bg-muted/20 relative p-4">
              <img
                src={slideImageUrls![currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />

              {/* Navigation arrows */}
              {slideImageUrls!.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 shadow-sm hover:bg-background"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 shadow-sm hover:bg-background"
                    onClick={nextSlide}
                    disabled={currentSlide === slideImageUrls!.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Slide counter + thumbnails */}
            <div className="px-4 py-3 border-t bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {currentSlide + 1} / {slideImageUrls!.length}
                </span>
              </div>
              {slideImageUrls!.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {slideImageUrls!.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                        i === currentSlide
                          ? 'border-[#0A66C2] ring-1 ring-[#0A66C2]/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : postContent ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="prose prose-sm max-w-none">
              {postContent.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-3' : ''}>
                  {line}
                </p>
              ))}
            </div>
            {hashtags && hashtags.length > 0 && (
              <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No content available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

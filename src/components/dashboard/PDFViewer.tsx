'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfUrl: string;
}

export default function PDFViewer({ open, onOpenChange, title, pdfUrl }: PDFViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-base font-semibold truncate max-w-[70%]">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              asChild
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

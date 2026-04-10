'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText } from 'lucide-react';

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfUrl: string;
  postContent?: string;
  hashtags?: string[];
}

export default function PDFViewer({ open, onOpenChange, title, pdfUrl, postContent, hashtags }: PDFViewerProps) {
  const hasPdf = Boolean(pdfUrl);
  const hasContent = Boolean(postContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-base font-semibold truncate max-w-[70%]">
              {title}
            </DialogTitle>
            {hasPdf && (
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
            )}
          </div>
        </DialogHeader>

        {hasPdf ? (
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={title}
            />
          </div>
        ) : hasContent ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="prose prose-sm max-w-none">
              {postContent!.split('\n').map((line, i) => (
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
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No content available</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

//@ts-nocheck
'use client';
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";

const MermaidChart = ({ chart }) => {
  const mermaidRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [renderedSvg, setRenderedSvg] = useState('');

  const renderDiagram = async () => {
    try {
      await mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#f4f4f5',
          primaryTextColor: '#0d0d0d',
          primaryBorderColor: '#e0e0e0',
          lineColor: '#9b9ba6',
          secondaryColor: '#ececec',
          tertiaryColor: '#fafaf9',
          fontFamily: 'inherit',
        },
        fontSize: 18,
      });

      const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(uniqueId, chart);

      // Modify SVG for responsive behavior while maintaining aspect ratio
      const modifiedSvg = svg
        .replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ')
        .replace(/width="[^"]+"/, 'width="100%"')
        .replace(/height="[^"]+"/, 'height="100%"')
        .replace(/style="[^"]+"/, 'style="display: block; max-width: 100%; height: auto; max-height: 100%;"');

      setRenderedSvg(modifiedSvg);

      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = svg;
      }
    } catch (error) {
      console.error('Mermaid rendering failed:', error);
      console.log(chart);
      setRenderedSvg('Failed to render diagram');
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = 'Failed to render diagram';
      }
    }
  };

  useEffect(() => {
    renderDiagram();
  }, [chart]);

  return (
    <div className="relative max-h-[70vh]">
      {/* Main diagram container */}
      <div className="group relative overflow-auto max-h-[70vh]">
        <div 
          ref={mermaidRef} 
          className="min-w-fit max-w-full mx-auto"
          style={{ transform: 'scale(0.9)' }}  // Slightly reduce the initial scale
        />
        
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-2 right-2 flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/80 px-3 py-1.5 text-sm font-medium text-[var(--ink-muted)] backdrop-blur-sm transition-colors hover:text-[var(--ink)]"
        >
          <Maximize2 className="w-4 h-4" />
          View
        </button>
      </div>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Portals to <body> (outside .module-theme), so colors must be
            self-contained: explicit ink text makes the close X visible on white. */}
        <DialogContent className="w-auto h-auto min-w-[85vw] max-w-[90vw] min-h-[85vh] max-h-[90vh] p-8 bg-white text-neutral-900 border border-neutral-200">
          <DialogTitle className="sr-only">
            Enlarged Diagram View
          </DialogTitle>
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            <div
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
              className="w-full h-full transform-gpu"
              style={{ 
                maxHeight: 'calc(90vh - 4rem)',
                overflowY: 'auto'
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MermaidChart;

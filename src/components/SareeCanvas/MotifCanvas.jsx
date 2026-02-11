import { useEffect, useRef } from 'react';
import { Canvas, FabricImage, filters } from 'fabric';

function MotifCanvas({
  bodyColor,
  onSelectionChange,
  onMotifCountChange,
  exposeActions, // callback to expose canvas actions to parent
}) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Safe zone margin (1% of canvas size, matching visual dashed border)
  const SAFE_MARGIN_PERCENT = 0.01;

  // Helper to get safe zone boundaries
  const getSafeBounds = (canvas) => {
    const margin = Math.min(canvas.width, canvas.height) * SAFE_MARGIN_PERCENT;
    return {
      left: margin,
      top: margin,
      right: canvas.width - margin,
      bottom: canvas.height - margin,
    };
  };

  // Initialize Fabric.js canvas (run once)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Prevent double initialization - dispose existing canvas first
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // STEP 1: Get container dimensions with fallback (prevents 0-size canvas)
    const containerWidth = containerRef.current.offsetWidth || 600;
    const containerHeight = containerRef.current.offsetHeight || 300;

    const canvas = new Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: bodyColor,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // STEP 2: Ensure background color always applied (Fabric.js v7 compatible)
    canvas.backgroundColor = bodyColor;
    canvas.renderAll();

    // Ensure canvas resizes with CSS (responsive)
    canvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true });

    // Handle object selection - notify parent with mobile-safe approach
    const notifySelection = () => {
      const active = canvas.getActiveObject() || null;
      if (onSelectionChange) onSelectionChange(active);
    };

    canvas.on('selection:created', notifySelection);
    canvas.on('selection:updated', notifySelection);
    canvas.on('selection:cleared', () => {
      if (onSelectionChange) onSelectionChange(null);
    });

    // Handle object modifications
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      obj.__justAdded = false;
      canvas.renderAll();
    });

    // Clamp movement within safe zone
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const bounds = getSafeBounds(canvas);

      obj.setCoords();
      const objBound = obj.getBoundingRect();

      // Clamp left edge
      if (objBound.left < bounds.left) {
        obj.left = Math.max(obj.left, obj.left + (bounds.left - objBound.left));
      }

      // Clamp top edge
      if (objBound.top < bounds.top) {
        obj.top = Math.max(obj.top, obj.top + (bounds.top - objBound.top));
      }

      // Clamp right edge
      if (objBound.left + objBound.width > bounds.right) {
        obj.left = Math.min(
          obj.left,
          obj.left - (objBound.left + objBound.width - bounds.right),
        );
      }

      // Clamp bottom edge
      if (objBound.top + objBound.height > bounds.bottom) {
        obj.top = Math.min(
          obj.top,
          obj.top - (objBound.top + objBound.height - bounds.bottom),
        );
      }
    });

    // Clamp scaling within safe zone
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      const bounds = getSafeBounds(canvas);

      obj.setCoords();
      const objBound = obj.getBoundingRect();

      // Clamp position if scaling pushed object outside
      if (objBound.left < bounds.left) {
        obj.left = Math.max(obj.left, obj.left + (bounds.left - objBound.left));
      }
      if (objBound.top < bounds.top) {
        obj.top = Math.max(obj.top, obj.top + (bounds.top - objBound.top));
      }

      // Clamp scale if object exceeds right boundary
      if (objBound.left + objBound.width > bounds.right) {
        const maxWidth = bounds.right - objBound.left;
        obj.scaleX =
          (maxWidth / obj.width) *
          Math.abs(obj.scaleX / Math.abs(obj.scaleX || 1));
      }

      // Clamp scale if object exceeds bottom boundary
      if (objBound.top + objBound.height > bounds.bottom) {
        const maxHeight = bounds.bottom - objBound.top;
        obj.scaleY =
          (maxHeight / obj.height) *
          Math.abs(obj.scaleY / Math.abs(obj.scaleY || 1));
      }
    });

    // Expose canvas actions to parent component
    if (exposeActions) {
      exposeActions({
        deleteSelected: () => {
          const active = canvas.getActiveObjects();
          if (!active || active.length === 0) return;

          active.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.requestRenderAll();

          if (onMotifCountChange) {
            onMotifCountChange(canvas.getObjects().length);
          }
          if (onSelectionChange) onSelectionChange(null);
        },

        colorSelected: (color) => {
          const active = canvas.getActiveObjects();
          if (!active || active.length === 0) return;

          active.forEach((obj) => {
            obj.filters = [
              new filters.BlendColor({
                color,
                mode: 'tint',
                alpha: 0.7,
              }),
            ];
            obj.applyFilters();
          });

          canvas.requestRenderAll();
        },
      });
    }

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []); // init once; bodyColor changes handled below

  // Listen for mobile touch drop events
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handleTouchDrop = (e) => {
      const { motif, x, y } = e.detail;
      addMotifToCanvas(motif, x, y);
    };

    canvasElement.addEventListener('motifTouchDrop', handleTouchDrop);
    return () => {
      canvasElement.removeEventListener('motifTouchDrop', handleTouchDrop);
    };
  }, []);

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const motifData = e.dataTransfer.getData('application/json');
    if (motifData && fabricCanvasRef.current) {
      const motif = JSON.parse(motifData);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addMotifToCanvas(motif, x, y);
    }
  };

  // Update background color when bodyColor changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = bodyColor;
      fabricCanvasRef.current.renderAll();
    }
  }, [bodyColor]);

  // ResizeObserver to handle dynamic sizing
  useEffect(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const canvas = fabricCanvasRef.current;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;

      if (w > 0 && h > 0) {
        canvas.setWidth(w);
        canvas.setHeight(h);
        canvas.renderAll();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const addMotifToCanvas = (motif, x, y) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const bounds = getSafeBounds(canvas);
    const scale = 0.3;

    // Estimate motif size (will be refined after image loads)
    const estimatedSize = 100 * scale; // approximate default motif size

    // Clamp drop position within safe zone
    let clampedX = Math.max(
      bounds.left + estimatedSize / 2,
      Math.min(x, bounds.right - estimatedSize / 2),
    );
    let clampedY = Math.max(
      bounds.top + estimatedSize / 2,
      Math.min(y, bounds.bottom - estimatedSize / 2),
    );

    FabricImage.fromURL(motif.thumbnail)
      .then((img) => {
        img.set({
          left: clampedX,
          top: clampedY,
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
        });

        // Mark as just added to prevent immediate warning
        img.__justAdded = true;

        // Add custom properties
        img.motifId = motif.id;
        img.motifName = motif.name;

        canvas.add(img);
        canvas.setActiveObject(img);

        // Final position adjustment after actual size is known
        img.setCoords();
        const objBound = img.getBoundingRect();

        // Fine-tune position to ensure it's fully within safe zone
        if (objBound.left < bounds.left) {
          img.left += bounds.left - objBound.left;
        }
        if (objBound.top < bounds.top) {
          img.top += bounds.top - objBound.top;
        }
        if (objBound.left + objBound.width > bounds.right) {
          img.left -= objBound.left + objBound.width - bounds.right;
        }
        if (objBound.top + objBound.height > bounds.bottom) {
          img.top -= objBound.top + objBound.height - bounds.bottom;
        }

        canvas.renderAll();

        const count = canvas.getObjects().length;
        if (onMotifCountChange) onMotifCountChange(count);
      })
      .catch((error) => {
        console.error('Error loading motif:', error);
      });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Safe Zone Guide - ONLY visual indicator */}
      <div
        className="absolute pointer-events-none border-2 border-dashed border-gray-400 rounded-sm"
        style={{
          top: '1%',
          left: '1%',
          right: '1%',
          bottom: '1%',
        }}
      />
    </div>
  );
}

export default MotifCanvas;



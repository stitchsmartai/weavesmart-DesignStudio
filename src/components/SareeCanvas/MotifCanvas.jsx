import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, filters } from 'fabric';
import { Trash2, RotateCcw } from 'lucide-react';

function MotifCanvas({ bodyColor }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [motifCount, setMotifCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(() => {
    const saved = localStorage.getItem('hideMotifInstructions');
    return saved !== 'true';
  });

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const canvas = new Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: bodyColor,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Ensure canvas resizes with CCS (responsive)
    canvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true });

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedMotif(e.selected[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedMotif(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedMotif(null);
    });

    // Handle object modifications and boundary constraints
    canvas.on('object:modified', () => {
      canvas.renderAll();
    });

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const bound = obj.getBoundingRect();

      // Keep object within canvas boundaries
      if (bound.left < 0) {
        obj.left = Math.max(obj.left, obj.left - bound.left);
      }
      if (bound.top < 0) {
        obj.top = Math.max(obj.top, obj.top - bound.top);
      }
      if (bound.left + bound.width > canvas.width) {
        obj.left = Math.min(obj.left, canvas.width - bound.width + obj.left - bound.left);
      }
      if (bound.top + bound.height > canvas.height) {
        obj.top = Math.min(obj.top, canvas.height - bound.height + obj.top - bound.top);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Listen for mobile touch drop events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchDrop = (e) => {
      const { motif, x, y } = e.detail;
      addMotifToCanvas(motif, x, y);
    };

    canvas.addEventListener('motifTouchDrop', handleTouchDrop);
    return () => {
      canvas.removeEventListener('motifTouchDrop', handleTouchDrop);
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

  const addMotifToCanvas = (motif, x, y) => {
    if (!fabricCanvasRef.current) return;

    FabricImage.fromURL(motif.thumbnail)
      .then((img) => {
        // Scale to reasonable size
        const scale = 0.3;
        img.set({
          left: x,
          top: y,
          scaleX: scale,
          scaleY: scale,
        });

        // Add custom properties
        img.motifId = motif.id;
        img.motifName = motif.name;

        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();

        setMotifCount(fabricCanvasRef.current.getObjects().length);
      })
      .catch((error) => {
        console.error('Error loading motif:', error);
      });
  };

  const deleteSelectedMotif = () => {
    if (!fabricCanvasRef.current || !selectedMotif) return;

    fabricCanvasRef.current.remove(selectedMotif);
    fabricCanvasRef.current.renderAll();
    setSelectedMotif(null);
    setMotifCount(fabricCanvasRef.current.getObjects().length);
  };

  const clearAllMotifs = () => {
    if (!fabricCanvasRef.current) return;

    if (confirm('Remove all motifs?')) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = bodyColor;
      fabricCanvasRef.current.renderAll();
      setMotifCount(0);
      setSelectedMotif(null);
    }
  };

  const changeMotifColor = (color) => {
    if (!selectedMotif) return;

    // Apply color filter to image
    selectedMotif.set('fill', color);

    // Create a color overlay effect
    selectedMotif.filters = [
      new filters.BlendColor({
        color: color,
        mode: 'tint',
        alpha: 0.5
      })
    ];
    selectedMotif.applyFilters();

    fabricCanvasRef.current.renderAll();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Motif Count Badge */}
      {motifCount > 0 && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
          {motifCount} motif{motifCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Instructions Notification (only when motif selected) */}
      {selectedMotif && showInstructions && (
        <div className="absolute top-4 right-4 bg-white border border-purple-200 rounded-lg shadow-xl px-4 py-3 text-sm text-gray-700 max-w-xs z-10">
          <div className="flex items-start space-x-2">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800 mb-1">Motif Controls</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Drag corners to resize • Drag to move • Delete key to remove
              </p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => {
                    localStorage.setItem('hideMotifInstructions', 'true');
                    setShowInstructions(false);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Don't show again
                </button>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motif Controls Bar (only when selected) */}
      {selectedMotif && (
        <div className="motif-controls absolute bottom-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-1.5 md:px-3 md:py-2 flex items-center space-x-2 md:space-x-3 z-10 scale-75 md:scale-100 origin-bottom-right transition-opacity duration-200">
          <span className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">{selectedMotif.motifName}</span>
          </span>

          <div className="flex items-center space-x-2">
            <input
              type="color"
              defaultValue="#000000"
              onChange={(e) => changeMotifColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-gray-300"
              title="Change color"
            />
          </div>

          <button
            onClick={deleteSelectedMotif}
            className="flex items-center space-x-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition text-xs"
            title="Delete motif"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Clear All Button */}
      {motifCount > 0 && !selectedMotif && (
        <div className="motif-controls absolute top-2 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-200">
          <button
            onClick={clearAllMotifs}
            className="flex items-center space-x-1.5 md:space-x-2 px-2 py-1.5 md:px-3 md:py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition text-xs md:text-sm shadow-lg scale-75 md:scale-100"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MotifCanvas;

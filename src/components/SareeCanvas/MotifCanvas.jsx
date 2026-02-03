import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, filters } from 'fabric';
import * as fabric from 'fabric';
import { Trash2, RotateCcw } from 'lucide-react';
import { calculateGridPositions } from '../../utils/gridPatternUtils';

function MotifCanvas({ bodyColor, patternSettings }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [motifCount, setMotifCount] = useState(0);
  const [gridMotifs, setGridMotifs] = useState([]); // Track motifs added via grid
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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

      // Get bounding box
      const bound = obj.getBoundingRect(true, true);

      // Canvas dimensions
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Keep object within canvas boundaries with some padding
      const padding = 10;

      // Left boundary
      if (bound.left < padding) {
        obj.left = Math.max(obj.left, obj.left - bound.left + padding);
      }

      // Top boundary
      if (bound.top < padding) {
        obj.top = Math.max(obj.top, obj.top - bound.top + padding);
      }

      // Right boundary
      if (bound.left + bound.width > canvasWidth - padding) {
        obj.left = Math.min(obj.left, canvasWidth - bound.width + obj.left - bound.left - padding);
      }

      // Bottom boundary
      if (bound.top + bound.height > canvasHeight - padding) {
        obj.top = Math.min(obj.top, canvasHeight - bound.height + obj.top - bound.top - padding);
      }

      obj.setCoords();
    });

    // Also constrain during scaling/resizing
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      const bound = obj.getBoundingRect(true, true);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const padding = 10;

      // If object is getting too big or going out of bounds, constrain it
      if (bound.left < padding || bound.top < padding ||
        bound.left + bound.width > canvasWidth - padding ||
        bound.top + bound.height > canvasHeight - padding) {

        // Revert to previous scale if it goes out of bounds
        obj.scaleX = obj.scaleX * 0.99;
        obj.scaleY = obj.scaleY * 0.99;
        obj.setCoords();
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

  // Live update grid when pattern settings change
  useEffect(() => {
    if (!fabricCanvasRef.current || !patternSettings || patternSettings.mode !== 'grid' || gridMotifs.length === 0) return;

    const canvas = fabricCanvasRef.current;
    const positions = calculateGridPositions(
      canvas.width,
      canvas.height,
      patternSettings.rows,
      patternSettings.cols,
      patternSettings.spacing,
      patternSettings.pattern
    );

    // Filter motifs that should exist based on new pattern
    const motifsToKeep = [];
    const motifsToRemove = [];

    gridMotifs.forEach((motif, index) => {
      if (index < positions.length) {
        // Update position
        const pos = positions[index];
        motif.set({
          left: pos.x,
          top: pos.y,
        });
        motif.gridPosition = { row: pos.row, col: pos.col };
        motifsToKeep.push(motif);
      } else {
        // Remove excess motifs
        motifsToRemove.push(motif);
      }
    });

    // Remove excess motifs from canvas
    motifsToRemove.forEach(motif => {
      canvas.remove(motif);
    });

    // Update grid motifs state
    setGridMotifs(motifsToKeep);
    setMotifCount(canvas.getObjects().length);
    canvas.renderAll();
  }, [patternSettings?.rows, patternSettings?.cols, patternSettings?.spacing, patternSettings?.pattern]);

  const addMotifToCanvas = (motif, x, y) => {
    if (!fabricCanvasRef.current) return;

    // Check if we're in grid mode
    const isGridMode = patternSettings && patternSettings.mode === 'grid';

    if (isGridMode) {
      // Grid mode: fill entire pattern
      const canvas = fabricCanvasRef.current;
      const positions = calculateGridPositions(
        canvas.width,
        canvas.height,
        patternSettings.rows,
        patternSettings.cols,
        patternSettings.spacing,
        patternSettings.pattern
      );

      // Add motif at each grid position
      const addedMotifs = [];
      const TARGET_SIZE = 50; // Fixed size in pixels

      positions.forEach((pos, index) => {
        FabricImage.fromURL(motif.svg || motif.thumbnail)
          .then((img) => {
            // Calculate scale to achieve target pixel size
            const scale = TARGET_SIZE / Math.max(img.width, img.height);

            img.set({
              left: pos.x,
              top: pos.y,
              scaleX: scale,
              scaleY: scale,
              originX: 'center',
              originY: 'center',
            });

            img.motifId = motif.id;
            img.motifName = motif.name;
            img.gridPosition = { row: pos.row, col: pos.col };
            img.isGridMotif = true; // Mark as grid motif

            canvas.add(img);
            addedMotifs.push(img);

            // Only set active on last one
            if (index === positions.length - 1) {
              canvas.setActiveObject(img);
              setGridMotifs(prev => [...prev, ...addedMotifs]);
            }

            canvas.renderAll();
            setMotifCount(canvas.getObjects().length);
          })
          .catch((error) => {
            console.error('Error loading motif:', error);
          });
      });
    } else {
      // Free mode: single placement
      const TARGET_SIZE = 80; // Slightly larger for free placement

      FabricImage.fromURL(motif.svg || motif.thumbnail)
        .then((img) => {
          // Calculate scale to achieve target pixel size
          const scale = TARGET_SIZE / Math.max(img.width, img.height);

          img.set({
            left: x,
            top: y,
            scaleX: scale,
            scaleY: scale,
          });

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
    }
  };

  const deleteSelectedMotif = () => {
    if (!fabricCanvasRef.current || !selectedMotif) return;

    // Check if it's a multi-selection
    const isMultiSelect = selectedMotif.type === 'activeSelection';

    if (isMultiSelect) {
      // Delete all objects in the selection
      const objectsToDelete = selectedMotif.getObjects();
      objectsToDelete.forEach(obj => {
        fabricCanvasRef.current.remove(obj);
        // Remove from gridMotifs if it's a grid motif
        if (obj.isGridMotif) {
          setGridMotifs(prev => prev.filter(m => m !== obj));
        }
      });
    } else {
      // Delete single object
      fabricCanvasRef.current.remove(selectedMotif);
      // Remove from gridMotifs if it's a grid motif
      if (selectedMotif.isGridMotif) {
        setGridMotifs(prev => prev.filter(m => m !== selectedMotif));
      }
    }

    fabricCanvasRef.current.renderAll();
    setSelectedMotif(null);
    setMotifCount(fabricCanvasRef.current.getObjects().length);
  };

  const clearAllMotifs = () => {
    if (!fabricCanvasRef.current) return;
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = bodyColor;
      fabricCanvasRef.current.renderAll();
      setMotifCount(0);
      setSelectedMotif(null);
    }
    setShowClearConfirm(false);
    setGridMotifs([]); // Clear grid tracking too
  };

  // Select all grid motifs
  const selectAllGridMotifs = () => {
    if (!fabricCanvasRef.current || gridMotifs.length === 0) return;

    const canvas = fabricCanvasRef.current;

    // Discard any current selection first
    canvas.discardActiveObject();

    // Create new selection with proper settings
    const selection = new fabric.ActiveSelection(gridMotifs, {
      canvas: canvas,
      lockScalingFlip: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerSize: 10,
      borderColor: '#3B82F6',
      cornerColor: '#3B82F6',
    });

    canvas.setActiveObject(selection);
    canvas.requestRenderAll();
  };

  // Delete all grid motifs
  const deleteAllGridMotifs = () => {
    if (!fabricCanvasRef.current || gridMotifs.length === 0) return;

    gridMotifs.forEach(motif => {
      fabricCanvasRef.current.remove(motif);
    });

    fabricCanvasRef.current.renderAll();
    setGridMotifs([]);
    setMotifCount(fabricCanvasRef.current.getObjects().length);
    setSelectedMotif(null);
  };

  const changeMotifColor = (color) => {
    if (!selectedMotif) return;

    // Check if it's a multi-selection
    const isMultiSelect = selectedMotif.type === 'activeSelection';
    const motifsToColor = isMultiSelect ? selectedMotif.getObjects() : [selectedMotif];

    motifsToColor.forEach(motif => {
      // Apply color filter to image
      motif.set('fill', color);

      // Create a color overlay effect
      motif.filters = [
        new filters.BlendColor({
          color: color,
          mode: 'tint',
          alpha: 0.5
        })
      ];
      motif.applyFilters();
    });

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
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10 pointer-events-none">
          {motifCount} motif{motifCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Grid Mode Indicator */}
      {patternSettings && patternSettings.mode === 'grid' && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10 flex items-center space-x-1 pointer-events-none">
          <span>⚡</span>
          <span>Grid: {patternSettings.rows}×{patternSettings.cols}</span>
        </div>
      )}

      {/* Grid Controls (when grid motifs exist) */}
      {gridMotifs.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 flex gap-2">
          <button
            onClick={selectAllGridMotifs}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition font-medium"
          >
            Select All ({gridMotifs.length})
          </button>
          <button
            onClick={deleteAllGridMotifs}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition font-medium"
          >
            Clear Grid
          </button>
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
            <span className="font-semibold text-gray-800">
              {selectedMotif.type === 'activeSelection'
                ? `${selectedMotif.size()} motifs selected`
                : selectedMotif.motifName}
            </span>
          </span>

          <div className="flex items-center space-x-2">
            <input
              type="color"
              defaultValue="#000000"
              onChange={(e) => changeMotifColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-gray-300"
              title={selectedMotif.type === 'activeSelection' ? 'Change color of all' : 'Change color'}
            />
          </div>

          <button
            onClick={deleteSelectedMotif}
            className="flex items-center space-x-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition text-xs"
            title={selectedMotif.type === 'activeSelection' ? 'Delete all selected' : 'Delete motif'}
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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clear All Motifs?</h3>
            <p className="text-sm text-gray-600 mb-4">This will remove all motifs from the canvas. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MotifCanvas;

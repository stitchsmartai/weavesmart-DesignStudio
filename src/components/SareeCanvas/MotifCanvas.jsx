import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, filters } from 'fabric';
import * as fabric from 'fabric';
import { Trash2, RotateCcw } from 'lucide-react';
import { calculateGridPositions } from '../../utils/gridPatternUtils';

function MotifCanvas({ bodyColor, patternSettings, tasselSettings }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const colorChangeTimeoutRef = useRef(null); // For debouncing color changes
  const tasselObjectsRef = useRef([]); // Track tassel Fabric objects
  const tasselSvgRef = useRef(null); // Track tassel SVG element for debugging
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [motifCount, setMotifCount] = useState(0);
  const [gridMotifs, setGridMotifs] = useState([]); // Track motifs added via grid
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Separate confirmation for delete
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
      renderOnAddRemove: false,
    });

    fabricCanvasRef.current = canvas;

    // Ensure canvas resizes with CSS (responsive)
    canvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true });
    // Handle object selection
    canvas.on('selection:created', (e) => {
      // For multi-select, e.selected contains all objects, but we want the ActiveSelection itself
      const selection = canvas.getActiveObject();
      setSelectedMotif(selection);
    });

    canvas.on('selection:updated', (e) => {
      const selection = canvas.getActiveObject();
      setSelectedMotif(selection);
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
      // Update coordinates for proper boundary detection
      obj.setCoords();
    });

    // Update coordinates during scaling/resizing
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      obj.setCoords();
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
  }, [patternSettings]); // Add patternSettings so grid mode works on mobile

  // Render tassels on pallu canvas (right edge)
  useEffect(() => {
    // DISABLED: Tassels are now rendered as SVG overlay, not in Fabric.js
    return;

    const canvas = fabricCanvasRef.current;
    if (!canvas || !tasselSettings) return;

    console.log('Tassel useEffect triggered', {
      enabled: tasselSettings.enabled,
      style: tasselSettings.style,
      color: tasselSettings.color,
      length: tasselSettings.length,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });

    // Remove existing tassels
    tasselObjectsRef.current.forEach(obj => canvas.remove(obj));
    tasselObjectsRef.current = [];

    // Only render if tassels are enabled
    if (!tasselSettings.enabled) {
      canvas.renderAll();
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const palluEdgeX = canvas.originalWidth || canvasWidth; // Original pallu width (without extension)

    // Tassel configuration
    const tasselCount = 12; // Reduced for better spacing
    const tasselSpacing = canvasHeight / (tasselCount + 1);
    const tasselLength = tasselSettings.length || 60;
    const tasselColor = tasselSettings.color || '#F59E0B';
    const tasselStyle = tasselSettings.style || 'simple';

    console.log('Creating tassels:', {
      tasselCount,
      tasselSpacing,
      tasselLength,
      tasselColor,
      tasselStyle,
      palluEdgeX,
      canvasWidth
    });

    // Create HORIZONTAL tassels extending BEYOND the pallu edge
    // Tassels start at pallu edge and extend outward into the extra canvas space
    for (let i = 1; i <= tasselCount; i++) {
      const yPosition = tasselSpacing * i; // Position along the height
      const xStart = palluEdgeX; // Start at pallu right edge
      const xEnd = palluEdgeX + tasselLength; // Extend outward

      let tasselObject;

      if (tasselStyle === 'simple') {
        // Simple fringe: horizontal line extending to the right
        tasselObject = new fabric.Line(
          [xStart, yPosition, xEnd, yPosition],
          {
            stroke: tasselColor,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            objectCaching: false,
          }
        );
      } else if (tasselStyle === 'beaded') {
        // Beaded: horizontal line with circles
        const elements = [];

        // Main horizontal line
        const line = new fabric.Line(
          [xStart, yPosition, xEnd, yPosition],
          {
            stroke: tasselColor,
            strokeWidth: 2,
            objectCaching: false,
          }
        );
        elements.push(line);

        // Add beads along the line
        const beadCount = 3;
        for (let b = 1; b <= beadCount; b++) {
          const beadX = xStart + (tasselLength / (beadCount + 1)) * b;
          const bead = new fabric.Circle({
            left: beadX,
            top: yPosition,
            radius: 3,
            fill: tasselColor,
            originX: 'center',
            originY: 'center',
            objectCaching: false,
          });
          elements.push(bead);
        }

        tasselObject = new fabric.Group(elements, {
          selectable: false,
          evented: false,
          objectCaching: false,
        });
      } else if (tasselStyle === 'twisted') {
        // Twisted: wavy horizontal line
        const points = [];
        const segments = 10;
        const amplitude = 3; // Vertical wave amplitude

        for (let s = 0; s <= segments; s++) {
          const segX = xStart + (tasselLength / segments) * s;
          const segY = yPosition + Math.sin((s / segments) * Math.PI * 4) * amplitude;
          points.push({ x: segX, y: segY });
        }

        tasselObject = new fabric.Polyline(points, {
          stroke: tasselColor,
          strokeWidth: 2,
          fill: '',
          selectable: false,
          evented: false,
          objectCaching: false,
        });
      }

      if (tasselObject) {
        canvas.add(tasselObject);
        tasselObjectsRef.current.push(tasselObject);
      }
    }

    console.log('Total tassels added:', tasselObjectsRef.current.length);

    // Send tassels to back so they don't cover motifs
    tasselObjectsRef.current.forEach(obj => canvas.sendObjectToBack(obj));
    canvas.renderAll();

  }, [tasselSettings]); // Re-render when tassel settings change

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
      const TARGET_SIZE = 20; // Small absolute size in pixels for grid

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
      const TARGET_SIZE = 20; // Small absolute size in pixels for free placement

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
    // Show confirmation modal first
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = () => {
    if (!fabricCanvasRef.current || !selectedMotif) return;

    const canvas = fabricCanvasRef.current;

    // Check if it's a multi-selection (NOTE: Fabric.js uses lowercase 'activeselection')
    if (selectedMotif.type === 'activeselection') {
      // For ActiveSelection, access the _objects property directly
      const objectsToDelete = selectedMotif._objects ? [...selectedMotif._objects] : [];

      if (objectsToDelete.length === 0) {
        setShowDeleteConfirm(false);
        return;
      }

      // Discard selection first
      canvas.discardActiveObject();

      // Now remove each object
      objectsToDelete.forEach((obj) => {
        canvas.remove(obj);
        // Remove from gridMotifs if it's a grid motif
        if (obj.isGridMotif) {
          setGridMotifs(prev => prev.filter(m => m !== obj));
        }
      });
    } else {
      // Single object delete
      canvas.remove(selectedMotif);
      if (selectedMotif.isGridMotif) {
        setGridMotifs(prev => prev.filter(m => m !== selectedMotif));
      }
    }

    canvas.renderAll();
    setSelectedMotif(null);
    setMotifCount(canvas.getObjects().length);
    setShowDeleteConfirm(false);
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

    // CRITICAL: Update the selectedMotif state so delete/color operations work!
    setSelectedMotif(selection);

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

    const motifsToColor = [];

    // Check if it's a multi-selection (NOTE: Fabric.js uses lowercase 'activeselection')
    if (selectedMotif.type === 'activeselection') {
      // Access the _objects property directly for ActiveSelection
      const objects = selectedMotif._objects || [];
      motifsToColor.push(...objects);
    } else {
      motifsToColor.push(selectedMotif);
    }

    motifsToColor.forEach((motif) => {
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

  // Debounced version to prevent lag during color picker sliding
  const handleColorChange = (color) => {
    // Clear any existing timeout
    if (colorChangeTimeoutRef.current) {
      clearTimeout(colorChangeTimeoutRef.current);
    }

    // Set new timeout - apply color after user stops sliding for 100ms
    colorChangeTimeoutRef.current = setTimeout(() => {
      changeMotifColor(color);
    }, 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50 overflow-visible"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Tassel Overlay - Absolutely positioned to extend beyond canvas */}
      {tasselSettings?.enabled && containerRef.current && (() => {
        const tasselCount = 12;
        const containerHeight = containerRef.current?.clientHeight || 0;
        const spacing = containerHeight / (tasselCount + 1);
        const tassels = [];

        // Debug logging
        console.log('🎀 Tassel Rendering Debug:', {
          enabled: tasselSettings.enabled,
          style: tasselSettings.style,
          color: tasselSettings.color,
          length: tasselSettings.length,
          tasselCount,
          containerHeight,
          spacing: spacing.toFixed(2),
          svgWidth: tasselSettings.length,
        });

        // Check actual rendered size after render
        setTimeout(() => {
          if (tasselSvgRef.current) {
            const rect = tasselSvgRef.current.getBoundingClientRect();
            console.log('📏 SVG Actual Rendered Size:', {
              width: rect.width,
              height: rect.height,
              expectedWidth: tasselSettings.length,
              expectedHeight: containerHeight,
              scaledDown: rect.width < tasselSettings.length,
            });
          }
        }, 100);

        for (let i = 1; i <= tasselCount; i++) {
          const y = spacing * i;
          const key = `tassel-${i}`;

          if (i === 1) {
            console.log(`  First tassel at y=${y.toFixed(2)}, x=0 to x=${tasselSettings.length}`);
          }

          if (tasselSettings.style === 'simple') {
            tassels.push(
              <line
                key={key}
                x1="0"
                y1={y}
                x2={tasselSettings.length}
                y2={y}
                stroke={tasselSettings.color}
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          } else if (tasselSettings.style === 'beaded') {
            const beadCount = 3;
            const elements = [
              <line
                key={`${key}-line`}
                x1="0"
                y1={y}
                x2={tasselSettings.length}
                y2={y}
                stroke={tasselSettings.color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ];
            for (let b = 1; b <= beadCount; b++) {
              const beadX = (tasselSettings.length / (beadCount + 1)) * b;
              elements.push(
                <circle
                  key={`${key}-bead-${b}`}
                  cx={beadX}
                  cy={y}
                  r="5"
                  fill={tasselSettings.color}
                />
              );
            }
            tassels.push(<g key={key}>{elements}</g>);
          } else if (tasselSettings.style === 'twisted') {
            const segments = 10;
            const amplitude = 5;
            let pathD = `M 0 ${y}`;
            for (let s = 1; s <= segments; s++) {
              const x = (tasselSettings.length / segments) * s;
              const waveY = y + Math.sin((s / segments) * Math.PI * 4) * amplitude;
              pathD += ` L ${x} ${waveY}`;
            }
            tassels.push(
              <path
                key={key}
                d={pathD}
                stroke={tasselSettings.color}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            );
          }
        }

        console.log(`  Total tassels rendered: ${tassels.length}`);

        return (
          <svg
            ref={tasselSvgRef}
            className="absolute top-0 pointer-events-none"
            width={tasselSettings.length}
            height={containerHeight}
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              width: `${tasselSettings.length}px`,
              height: `${containerHeight}px`,
            }}
          >
            {tassels}
          </svg>
        );
      })()}

      {/* Status Badges - Centered at top to avoid blocking corners */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pointer-events-none">
        {/* Motif Count Badge */}
        {motifCount > 0 && (
          <div className="bg-purple-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
            {motifCount} motif{motifCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Grid Mode Indicator */}
        {patternSettings && patternSettings.mode === 'grid' && (
          <div className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <span>⚡</span>
            <span>Grid: {patternSettings.rows}×{patternSettings.cols}</span>
          </div>
        )}
      </div>

      {/* Grid Controls - Centered at bottom to avoid blocking corners */}
      {gridMotifs.length > 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg p-1.5 z-10 flex gap-2">
          <button
            onClick={selectAllGridMotifs}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded transition font-medium"
          >
            Select All ({gridMotifs.length})
          </button>
          <button
            onClick={deleteAllGridMotifs}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded transition font-medium"
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

      {/* Motif Controls Bar (only when selected) - Compact and semi-transparent */}
      {selectedMotif && (
        <div className="motif-controls absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg px-2 py-1 flex items-center gap-2 z-10 transition-opacity duration-200">
          <span className="text-[10px] text-gray-600">
            <span className="font-semibold text-gray-800">
              {selectedMotif.type === 'activeselection'
                ? `${selectedMotif.size()} selected`
                : selectedMotif.motifName}
            </span>
          </span>

          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border border-gray-300"
            title={selectedMotif.type === 'activeselection' ? 'Change color of all' : 'Change color'}
          />

          <button
            onClick={deleteSelectedMotif}
            className="flex items-center px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
            title={selectedMotif.type === 'activeselection' ? 'Delete all selected' : 'Delete motif'}
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

      {/* Delete Selected Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Selected Motif{selectedMotif?.type === 'activeselection' ? 's' : ''}?</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedMotif?.type === 'activeselection'
                ? `This will delete ${selectedMotif.size()} selected motifs. This action cannot be undone.`
                : 'This will delete the selected motif. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSelected}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MotifCanvas;

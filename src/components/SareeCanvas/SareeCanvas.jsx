import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Lock, Unlock, RotateCw } from 'lucide-react';
import MotifCanvas from './MotifCanvas';

function SareeCanvas({ bodyColor, borderColor, palluColor, selectedSection, setSelectedSection, bodyPatternSettings, palluPatternSettings }) {
  const [zoom, setZoom] = useState(100);
  const [lastTap, setLastTap] = useState(0);
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(100);
  const [isZoomLocked, setIsZoomLocked] = useState(false);
  const [rotation, setRotation] = useState(0); // 0 = horizontal, 90 = vertical
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Handle zoom in/out with buttons
  const handleZoomIn = () => {
    if (!isZoomLocked) {
      setZoom(prev => Math.min(prev + 10, 200));
    }
  };

  const handleZoomOut = () => {
    if (!isZoomLocked) {
      setZoom(prev => Math.max(prev - 10, 50));
    }
  };

  const handleResetZoom = () => {
    if (!isZoomLocked) {
      setZoom(100);
      setPanOffset({ x: 0, y: 0 }); // Reset pan when resetting zoom
    }
  };

  const toggleZoomLock = () => {
    setIsZoomLocked(!isZoomLocked);
  };

  const toggleRotation = () => {
    if (!isZoomLocked) {
      setRotation(prev => (prev + 90) % 180); // Toggle between 0 and 90
    }
  };

  // Handle double-tap zoom
  const handleDoubleTap = (e) => {
    if (isZoomLocked) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (zoom === 100) {
        setZoom(150);
      } else {
        setZoom(100);
      }
    }
    setLastTap(now);
  };

  // Calculate distance between two touch points
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialZoom(zoom);
    }
  };

  const handleTouchMove = (e) => {
    if (isZoomLocked) return;

    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialPinchDistance;
      const newZoom = Math.max(50, Math.min(200, initialZoom * scale));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setIsPinching(false);
    }
    setIsPanning(false);
  };

  // Pan/Drag handlers for when zoomed in
  const handleMouseDown = (e) => {
    if (zoom > 100 && !isZoomLocked) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && zoom > 100 && !isZoomLocked) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch pan for mobile
  const handleTouchStartPan = (e) => {
    if (zoom > 100 && e.touches.length === 1 && !isZoomLocked) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    }
  };

  const handleTouchMovePan = (e) => {
    if (isPanning && zoom > 100 && e.touches.length === 1 && !isZoomLocked) {
      e.preventDefault();
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 bg-gray-50 flex items-center justify-center overflow-auto relative ${rotation === 90 ? 'py-16' : 'py-4'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom Controls - Horizontal on mobile portrait, vertical on desktop */}
      <div className="zoom-controls-mobile fixed bottom-4 left-4 right-4 md:bottom-auto md:top-24 md:right-8 md:left-auto z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 md:p-2 flex flex-row md:flex-col items-center justify-between md:justify-start gap-1 md:gap-0 md:space-y-2">
        <button
          onClick={handleZoomIn}
          className={`p-1.5 md:p-2 hover:bg-gray-100 rounded transition flex-shrink-0 ${isZoomLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Zoom In"
          disabled={isZoomLocked}
        >
          <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <button
          onClick={handleZoomOut}
          className={`p-1.5 md:p-2 hover:bg-gray-100 rounded transition flex-shrink-0 ${isZoomLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Zoom Out"
          disabled={isZoomLocked}
        >
          <ZoomOut className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <div className="flex items-center px-1.5 md:px-2 text-xs font-semibold text-gray-700 flex-shrink-0">
          {Math.round(zoom)}%
        </div>

        <button
          onClick={handleResetZoom}
          className={`text-xs px-1.5 md:px-2 py-1 hover:bg-gray-100 rounded transition text-gray-600 flex-shrink-0 ${isZoomLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Reset Zoom"
          disabled={isZoomLocked}
        >
          Reset
        </button>

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block border-t border-gray-200 my-1"></div>

        {/* Zoom Lock Button */}
        <button
          onClick={toggleZoomLock}
          className={`p-1.5 md:p-2 rounded transition flex-shrink-0 ${isZoomLocked ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'}`}
          title={isZoomLocked ? "Unlock Zoom" : "Lock Zoom"}
        >
          {isZoomLocked ? <Lock className="w-4 h-4 md:w-5 md:h-5" /> : <Unlock className="w-4 h-4 md:w-5 md:h-5" />}
        </button>

        {/* Rotation Button */}
        <button
          onClick={toggleRotation}
          className={`p-1.5 md:p-2 rounded transition flex-shrink-0 ${isZoomLocked ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
          title={rotation === 0 ? "Rotate to Vertical" : "Rotate to Horizontal"}
          disabled={isZoomLocked}
        >
          <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="saree-canvas-container w-full px-4 md:px-4 max-w-5xl landscape:max-w-4xl">

        <div
          ref={canvasWrapperRef}
          className={`bg-white rounded-xl shadow-2xl overflow-hidden ${zoom > 100 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onClick={handleDoubleTap}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            handleTouchStart(e);
            handleTouchStartPan(e);
          }}
          onTouchMove={(e) => {
            handleTouchMove(e);
            handleTouchMovePan(e);
          }}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isPinching || isPanning ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {/* Saree Visualization - Increased Height */}
          <div
            className="w-full relative flex flex-col shadow-lg border-2 border-gray-100"
            style={{ aspectRatio: '5/2.2' }}
          >
            {/* Top Border (10% Height) */}
            <div
              style={{ height: '10%', backgroundColor: borderColor }}
              className={`w-full relative group cursor-pointer transition-colors hover:brightness-110 ${selectedSection === 'border' ? 'ring-4 ring-purple-600 ring-inset z-10' : ''
                }`}
              onClick={() => setSelectedSection('border')}
              title="Top Border"
            >
              {selectedSection === 'border' && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                  Border
                </div>
              )}
            </div>

            {/* Middle Row (80% Height) */}
            <div className="flex w-full" style={{ height: '80%' }}>

              {/* Body Section (75% Width) - Contains MotifCanvas */}
              <div
                style={{ width: '75%' }}
                className={`h-full relative group transition-all ${selectedSection === 'body' ? 'ring-4 ring-purple-600 ring-inset z-10' : ''
                  }`}
                onClick={() => setSelectedSection('body')}
              >
                {/* Only allow clicks on the container to select the section, MotifCanvas handles its own interactions */}
                <div className="absolute inset-0 pointer-events-none border-r border-black/5"></div>

                <div className="h-full w-full">
                  <MotifCanvas bodyColor={bodyColor} patternSettings={bodyPatternSettings} />
                </div>

                {selectedSection === 'body' && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg z-20 pointer-events-none">
                    Body
                  </div>
                )}
              </div>

              {/* Pallu Section (25% Width) */}
              <div
                style={{ width: '25%' }}
                className={`h-full relative group transition-all ${selectedSection === 'pallu' ? 'ring-4 ring-purple-600 ring-inset z-10' : ''
                  }`}
                onClick={() => setSelectedSection('pallu')}
              >
                <div className="absolute inset-0 pointer-events-none border-l border-black/5"></div>

                <div className="h-full w-full">
                  <MotifCanvas bodyColor={palluColor} patternSettings={palluPatternSettings} />
                </div>

                {selectedSection === 'pallu' && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg z-20 pointer-events-none">
                    Pallu
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Border (10% Height) */}
            <div
              style={{ height: '10%', backgroundColor: borderColor }}
              className={`w-full relative group cursor-pointer transition-colors hover:brightness-110 ${selectedSection === 'border' ? 'ring-4 ring-purple-600 ring-inset z-10' : ''
                }`}
              onClick={() => setSelectedSection('border')}
              title="Bottom Border"
            >
              {selectedSection === 'border' && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                  Border
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SareeCanvas;

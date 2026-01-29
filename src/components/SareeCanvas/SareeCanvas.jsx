import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import MotifCanvas from './MotifCanvas';

function SareeCanvas({ bodyColor, borderColor, palluColor, selectedSection, setSelectedSection }) {
  const [zoom, setZoom] = useState(100);
  const [lastTap, setLastTap] = useState(0);
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(100);

  // Handle zoom in/out with buttons
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  // Handle double-tap zoom
  const handleDoubleTap = (e) => {
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
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-50 flex items-center justify-center py-4 overflow-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom Controls - Fixed position outside canvas */}
      <div className="fixed top-24 right-8 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <div className="text-xs font-semibold text-center text-gray-700 py-1">
          {Math.round(zoom)}%
        </div>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleResetZoom}
          className="text-xs px-2 py-1 hover:bg-gray-100 rounded transition text-gray-600"
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>

      <div className="w-full max-w-5xl px-4">

        <div
          ref={canvasWrapperRef}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={handleDoubleTap}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: isPinching ? 'none' : 'transform 0.2s ease-out',
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
                  <MotifCanvas bodyColor={bodyColor} />
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
                  <MotifCanvas bodyColor={palluColor} />
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

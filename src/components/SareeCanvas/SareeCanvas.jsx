import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Lock, Unlock, RotateCw, Trash2 } from "lucide-react";
import MotifCanvas from "./MotifCanvas";
import MiniMap from "./MiniMap";

function SareeCanvas({
  bodyColor,
  borderColor,
  palluColor,
  selectedSection,
  setSelectedSection,
}) {
  // STEP 2: Separate state for body and pallu
  const [selectedMotifBody, setSelectedMotifBody] = useState(null);
  const [selectedMotifPallu, setSelectedMotifPallu] = useState(null);
  const [motifCountBody, setMotifCountBody] = useState(0);
  const [motifCountPallu, setMotifCountPallu] = useState(0);

  // Global UI states
  const [showInstructions, setShowInstructions] = useState(() => {
    const saved = localStorage.getItem("hideMotifInstructions");
    return saved !== "true";
  });

  // Determine which motif is selected based on active section
  const selectedMotif =
    selectedSection === "body"
      ? selectedMotifBody
      : selectedSection === "pallu"
      ? selectedMotifPallu
      : null;

  const motifCount = motifCountBody + motifCountPallu;

  // STEP 3: Event handlers for body canvas
  const handleBodySelectionChange = (motif) => {
    setSelectedMotifBody(motif);
  };

  const handleBodyMotifCountChange = (count) => {
    setMotifCountBody(count);
  };

  // STEP 3: Event handlers for pallu canvas
  const handlePalluSelectionChange = (motif) => {
    setSelectedMotifPallu(motif);
  };

  const handlePalluMotifCountChange = (count) => {
    setMotifCountPallu(count);
  };

  // Refs to store canvas actions exposed from MotifCanvas
  const bodyActionsRef = useRef(null);
  const palluActionsRef = useRef(null);
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
  const [isMiniMapExpanded, setIsMiniMapExpanded] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Auto-collapse mini-map when zoom resets to 100%
  useEffect(() => {
    if (zoom === 100) {
      setIsMiniMapExpanded(false);
    }
  }, [zoom]);

  // Keyboard Delete support for selected motif
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && selectedMotif) {
        const actions =
          selectedSection === "body"
            ? bodyActionsRef.current
            : palluActionsRef.current;

        actions?.deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMotif, selectedSection]);

  // Handle zoom in/out with buttons
  const handleZoomIn = () => {
    if (!isZoomLocked) {
      setZoom((prev) => Math.min(prev + 10, 200));
    }
  };

  const handleZoomOut = () => {
    if (!isZoomLocked) {
      setZoom((prev) => Math.max(prev - 10, 50));
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
      setRotation((prev) => (prev + 90) % 180); // Toggle between 0 and 90
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
        y: e.clientY - panStart.y,
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
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMovePan = (e) => {
    if (isPanning && zoom > 100 && e.touches.length === 1 && !isZoomLocked) {
      e.preventDefault();
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 bg-gray-50 flex items-center justify-center overflow-auto relative ${
        rotation === 90 ? "py-16" : "py-4"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom Controls - Adapts based on canvas orientation */}
      <div className={`
        zoom-controls z-30 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 
        ${rotation === 90
          ? 'fixed top-24 right-4 p-2 flex flex-col space-y-2' // Portrait: top-right, vertical
          : 'fixed bottom-6 left-1/2 -translate-x-1/2 p-1.5 md:p-2 flex flex-row items-center gap-2 md:gap-1' // Landscape: bottom-center horizontal to avoid tassels
        }
      `}>
        <button
          onClick={handleZoomIn}
          className={`p-1.5 md:p-2 hover:bg-gray-100 rounded transition flex-shrink-0 ${
            isZoomLocked ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Zoom In"
          disabled={isZoomLocked}
        >
          <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <button
          onClick={handleZoomOut}
          className={`p-1.5 md:p-2 hover:bg-gray-100 rounded transition flex-shrink-0 ${
            isZoomLocked ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
          className={`text-xs px-1.5 md:px-2 py-1 hover:bg-gray-100 rounded transition text-gray-600 flex-shrink-0 ${
            isZoomLocked ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Reset Zoom"
          disabled={isZoomLocked}
        >
          Reset
        </button>

        {/* Divider */}
        <div className={`border-gray-200 ${rotation === 90 ? 'border-t my-1' : 'hidden md:block md:border-t md:my-1'}`}></div>

        {/* Zoom Lock Button */}
        <button
          onClick={toggleZoomLock}
          className={`p-1.5 md:p-2 rounded transition flex-shrink-0 ${
            isZoomLocked
              ? "bg-purple-100 text-purple-700"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title={isZoomLocked ? "Unlock Zoom" : "Lock Zoom"}
        >
          {isZoomLocked ? (
            <Lock className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Unlock className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>

        {/* Rotation Button */}
        <button
          onClick={toggleRotation}
          className={`p-1.5 md:p-2 rounded transition flex-shrink-0 ${
            isZoomLocked
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title={rotation === 0 ? "Rotate to Vertical" : "Rotate to Horizontal"}
          disabled={isZoomLocked}
        >
          <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="saree-canvas-container w-full px-4 md:px-4 max-w-5xl landscape:max-w-4xl">
        <div
          ref={canvasWrapperRef}
          className={`bg-white rounded-xl shadow-2xl overflow-hidden ${
            zoom > 100 ? "cursor-grab active:cursor-grabbing" : ""
          }`}
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
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${
              zoom / 100
            }) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition:
              isPinching || isPanning ? "none" : "transform 0.3s ease-out",
          }}
        >
          {/* Saree Visualization - Increased Height */}
          <div
            className="w-full relative flex flex-col shadow-lg border-2 border-gray-100"
            style={{ aspectRatio: "5/2.2" }}
          >
            {/* Top Border (10% Height) */}
            <div
              style={{ height: "10%", backgroundColor: borderColor }}
              className={`w-full relative group cursor-pointer transition-colors hover:brightness-110 ${
                selectedSection === "border"
                  ? "ring-4 ring-purple-600 ring-inset z-10"
                  : ""
              }`}
              onClick={() => setSelectedSection("border")}
              title="Top Border"
            >
              {selectedSection === "border" && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                  Border
                </div>
              )}
            </div>

            {/* Middle Row (80% Height) */}
            <div className="flex w-full" style={{ height: "80%" }}>
              {/* Body Section (75% Width) - Contains MotifCanvas */}
              <div
                style={{ width: "75%" }}
                className={`h-full relative group transition-all ${
                  selectedSection === "body"
                    ? "ring-4 ring-purple-600 ring-inset z-10"
                    : ""
                }`}
                onClick={() => setSelectedSection("body")}
              >
                {/* Only allow clicks on the container to select the section, MotifCanvas handles its own interactions */}
                <div className="absolute inset-0 pointer-events-none border-r border-black/5"></div>

                <div className="h-full w-full body-canvas-container">
                  <MotifCanvas
                    bodyColor={bodyColor}
                    onSelectionChange={(motif) => {
                      setSelectedSection("body");
                      handleBodySelectionChange(motif);
                    }}
                    onMotifCountChange={handleBodyMotifCountChange}
                    exposeActions={(actions) =>
                      (bodyActionsRef.current = actions)
                    }
                  />
                </div>

                {selectedSection === "body" && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg z-20 pointer-events-none">
                    Body
                  </div>
                )}
              </div>

              {/* Pallu Section (25% Width) */}
              <div
                style={{ width: "25%" }}
                className={`h-full relative group transition-all ${
                  selectedSection === "pallu"
                    ? "ring-4 ring-purple-600 ring-inset z-10"
                    : ""
                }`}
                onClick={() => setSelectedSection("pallu")}
              >
                <div className="absolute inset-0 pointer-events-none border-l border-black/5"></div>

                <div className="h-full w-full pallu-canvas-container">
                  <MotifCanvas
                    bodyColor={palluColor}
                    onSelectionChange={(motif) => {
                      setSelectedSection("pallu");
                      handlePalluSelectionChange(motif);
                    }}
                    onMotifCountChange={handlePalluMotifCountChange}
                    exposeActions={(actions) =>
                      (palluActionsRef.current = actions)
                    }
                  />
                </div>

                {selectedSection === "pallu" && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg z-20 pointer-events-none">
                    Pallu
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Border (10% Height) */}
            <div
              style={{ height: "10%", backgroundColor: borderColor }}
              className={`w-full relative group cursor-pointer transition-colors hover:brightness-110 ${
                selectedSection === "border"
                  ? "ring-4 ring-purple-600 ring-inset z-10"
                  : ""
              }`}
              onClick={() => setSelectedSection("border")}
              title="Bottom Border"
            >
              {selectedSection === "border" && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                  Border
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: Global UI Layer - Outside canvas containers */}

      {/* Instructions Popup */}
      {selectedMotif && showInstructions && (
        <div className="fixed bottom-24 right-6 z-50 bg-white border border-purple-200 rounded-xl shadow-2xl px-5 py-4 text-sm text-gray-700 max-w-xs">
          <div className="flex items-start space-x-3">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 mb-1">Motif Controls</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Drag corners to resize • Drag to move • Delete key to remove
              </p>
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => {
                    localStorage.setItem("hideMotifInstructions", "true");
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

      {/* Delete Button - Bottom Right */}
      {selectedMotif && (
        <div className="fixed bottom-32 md:bottom-6 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 right-auto md:right-6 z-[60] bg-purple-600 rounded-lg shadow-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const actions =
                  selectedSection === "body"
                    ? bodyActionsRef.current
                    : palluActionsRef.current;

                actions?.deleteSelected();
              }}
              className="text-white hover:bg-purple-700 p-2 rounded transition"
              title="Delete Motif"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="border-l border-purple-400 h-6"></div>

            {/* Color Picker */}
            <div className="relative flex items-center">
              <input
                type="color"
                onChange={(e) => {
                  const color = e.target.value;
                  const actions =
                    selectedSection === "body"
                      ? bodyActionsRef.current
                      : palluActionsRef.current;

                  actions?.colorSelected(color);
                }}
                className="w-9 h-9 md:w-8 md:h-8 rounded cursor-pointer border-2 border-white bg-white"
                style={{ WebkitAppearance: "none" }}
                title="Change Motif Color"
              />
            </div>
          </div>
        </div>
      )}

      {/* Motif Count Badge */}
      {motifCount > 0 && (
        <div className="fixed top-4 left-4 z-50 bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
          {motifCount} motif{motifCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Mini Map — visible only when zoomed in */}
      {zoom > 100 && (
        <MiniMap
          zoom={zoom}
          panOffset={panOffset}
          rotation={rotation}
          onNavigate={({ x, y }) => setPanOffset({ x, y })}
          expanded={isMiniMapExpanded}
          setExpanded={setIsMiniMapExpanded}
        />
      )}
    </div>
  );
}

export default SareeCanvas;

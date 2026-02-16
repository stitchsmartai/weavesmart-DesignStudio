import { X, Maximize2, Minimize2 } from 'lucide-react';

function MiniMap({ zoom, panOffset, rotation, onNavigate, expanded, setExpanded }) {
  // Mini-map dimensions
  const MINI_WIDTH_COLLAPSED = 160;
  const MINI_HEIGHT_COLLAPSED = 70;
  const MINI_WIDTH_EXPANDED = 320;
  const MINI_HEIGHT_EXPANDED = 140;

  const miniWidth = expanded ? MINI_WIDTH_EXPANDED : MINI_WIDTH_COLLAPSED;
  const miniHeight = expanded ? MINI_HEIGHT_EXPANDED : MINI_HEIGHT_COLLAPSED;

  // Saree aspect ratio (5:2.2 from SareeCanvas)
  const SAREE_ASPECT = 5 / 2.2;

  // Calculate viewport rectangle dimensions and position
  // Viewport size is inversely proportional to zoom
  const viewportWidth = Math.min(miniWidth / (zoom / 100), miniWidth * 0.9);
  const viewportHeight = Math.min(miniHeight / (zoom / 100), miniHeight * 0.9);

  // Calculate viewport position based on pan offset
  // When panning right (positive panOffset.x), the content moves right, viewport moves left
  const scale = miniWidth / 1000; // Assume base canvas width of ~1000px
  const viewportX = Math.max(0, Math.min(
    miniWidth - viewportWidth,
    (miniWidth - viewportWidth) / 2 - (panOffset.x * scale)
  ));
  const viewportY = Math.max(0, Math.min(
    miniHeight - viewportHeight,
    (miniHeight - viewportHeight) / 2 - (panOffset.y * scale)
  ));

  // Handle click/touch on mini-map to navigate (supports both desktop and mobile)
  const handleClick = (e) => {
    if (!expanded) {
      setExpanded(true);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const zoomScale = zoom / 100;

    // Center of the mini-map viewport
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    // SNAP calculation (absolute positioning, not relative)
    // This instantly centers the clicked point on the main canvas
    const newPanX = -(clickX - viewportCenterX) * zoomScale;
    const newPanY = -(clickY - viewportCenterY) * zoomScale;

    onNavigate({
      x: newPanX,
      y: newPanY
    });
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div
      className={`absolute bottom-4 right-4 bg-white shadow-2xl border-2 border-gray-200 rounded-lg z-40 transition-all duration-300 overflow-hidden ${
        expanded ? 'w-80 h-[140px]' : 'w-40 h-[70px]'
      }`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent p-1.5 flex items-center justify-between z-10 pointer-events-none">
        <span className="text-xs font-semibold text-white drop-shadow-lg">
          {expanded ? 'Mini Map' : 'Map'}
        </span>
        <div className="flex items-center space-x-1 pointer-events-auto">
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-white/20 rounded transition text-white"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Mini canvas representation */}
      <div
        className={`relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded overflow-hidden ${
          expanded ? 'cursor-pointer' : 'cursor-pointer'
        }`}
        onClick={handleClick}
        onTouchStart={(e) => {
          // Support mobile tap navigation
          if (e.touches[0]) {
            const touchEvent = {
              currentTarget: e.currentTarget,
              clientX: e.touches[0].clientX,
              clientY: e.touches[0].clientY
            };
            handleClick(touchEvent);
          }
        }}
      >
        {/* Saree outline representation */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-300 bg-white/50"
          style={{
            width: `${miniWidth * 0.8}px`,
            height: `${miniWidth * 0.8 / SAREE_ASPECT}px`,
          }}
        >
          {/* Top border */}
          <div className="w-full h-[10%] bg-amber-500/30 border-b border-gray-200" />
          
          {/* Middle section */}
          <div className="flex h-[80%]">
            {/* Body */}
            <div className="w-[75%] bg-red-500/20 border-r border-gray-200" />
            {/* Pallu */}
            <div className="w-[25%] bg-pink-500/30" />
          </div>
          
          {/* Bottom border */}
          <div className="w-full h-[10%] bg-amber-500/30 border-t border-gray-200" />
        </div>

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-purple-600 bg-purple-500/20 rounded-sm pointer-events-none transition-all duration-200"
          style={{
            width: `${viewportWidth}px`,
            height: `${viewportHeight}px`,
            left: `${viewportX}px`,
            top: `${viewportY}px`,
          }}
        >
          <div className="absolute inset-0 border border-white/50" />
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
          {Math.round(zoom)}%
        </div>

        {/* Click hint (only when collapsed) */}
        {!expanded && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
            <span className="text-xs text-white font-medium drop-shadow">
              Click to expand
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiniMap;

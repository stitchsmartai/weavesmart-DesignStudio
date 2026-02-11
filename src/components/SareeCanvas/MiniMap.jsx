import { X, Maximize2, Minimize2 } from 'lucide-react';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

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
  const zoomScale = zoom / 100;

  // Viewport shrinks when zoom increases
  const viewportWidth = miniWidth / zoomScale;
  const viewportHeight = miniHeight / zoomScale;

  // Convert canvas panOffset → minimap position, clamped to mini-map bounds
  const viewportX = clamp(
    miniWidth / 2 - viewportWidth / 2 - panOffset.x / zoomScale,
    0,
    miniWidth - viewportWidth
  );
  const viewportY = clamp(
    miniHeight / 2 - viewportHeight / 2 - panOffset.y / zoomScale,
    0,
    miniHeight - viewportHeight
  );

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

    // SNAP calculation: center clicked point in main canvas
    const newPanX = (miniWidth / 2 - clickX) * zoomScale;
    const newPanY = (miniHeight / 2 - clickY) * zoomScale;

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
      className={`fixed bottom-4 md:bottom-24 right-4 md:right-6 bg-white shadow-2xl border-2 border-gray-200 rounded-lg z-[70] transition-all duration-300 overflow-hidden ${
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

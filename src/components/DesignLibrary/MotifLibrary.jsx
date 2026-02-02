import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function MotifLibrary({ selectedMotifs, setSelectedMotifs, onMotifDragStart }) {
  const [isOpen, setIsOpen] = useState(false);

  const motifs = [
    { id: 1, name: 'Paisley', thumbnail: '/motifs/paisley.png', svg: '/motifs/paisley.svg' },
    { id: 2, name: 'Peacock Simple', thumbnail: '/motifs/peacock-simple.png', svg: '/motifs/peacock-simple.svg' },
    { id: 3, name: 'Peacock Detailed', thumbnail: '/motifs/peacock-detailed.png', svg: '/motifs/peacock-detailed.svg' },
    { id: 4, name: 'Flower Bouquet', thumbnail: '/motifs/flower-bouquet.png', svg: '/motifs/flower-bouquet.svg' },
    { id: 5, name: 'Leaf Branch', thumbnail: '/motifs/leaf-branch.png', svg: '/motifs/leaf-branch.svg' },
  ];

  const handleDragStart = (e, motif) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(motif));
    if (onMotifDragStart) {
      onMotifDragStart(motif);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Motif Library</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0">
          <p className="text-xs text-gray-500 mb-3">
            💡 Drag motifs onto the saree body to place them
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-full">
            {motifs.map((motif) => (
              <div
                key={motif.id}
                draggable
                onDragStart={(e) => handleDragStart(e, motif)}
                onTouchStart={(e) => {
                  // Mobile touch drag
                  const touch = e.touches[0];
                  const clone = e.currentTarget.cloneNode(true);
                  clone.style.position = 'fixed';
                  clone.style.width = '80px';
                  clone.style.height = '80px';
                  clone.style.opacity = '0.8';
                  clone.style.pointerEvents = 'none';
                  clone.style.zIndex = '9999';
                  clone.id = 'drag-clone';
                  document.body.appendChild(clone);

                  const moveClone = (touch) => {
                    clone.style.left = (touch.clientX - 40) + 'px';
                    clone.style.top = (touch.clientY - 40) + 'px';
                  };
                  moveClone(touch);

                  // Store motif data
                  const motifData = { ...motif };
                  let hasMoved = false;
                  const sidebar = document.querySelector('.design-library-sidebar');

                  const handleTouchMove = (e) => {
                    e.preventDefault();

                    if (!hasMoved && sidebar) {
                      hasMoved = true;
                      // Make sidebar completely invisible during drag
                      sidebar.style.opacity = '0';
                      sidebar.style.pointerEvents = 'none';

                      // Hide motif controls during drag
                      const controls = document.querySelectorAll('.motif-controls');
                      controls.forEach(ctrl => {
                        ctrl.style.opacity = '0';
                      });
                    }

                    moveClone(e.touches[0]);
                  };

                  const handleTouchEnd = (e) => {
                    const touch = e.changedTouches[0];

                    // Restore sidebar opacity
                    if (sidebar) {
                      sidebar.style.opacity = '1';
                      sidebar.style.pointerEvents = 'auto';
                    }

                    // Restore motif controls
                    const controls = document.querySelectorAll('.motif-controls');
                    controls.forEach(ctrl => {
                      ctrl.style.opacity = '1';
                    });

                    // Clean up clone
                    try {
                      const cloneEl = document.getElementById('drag-clone');
                      if (cloneEl && cloneEl.parentNode) {
                        cloneEl.parentNode.removeChild(cloneEl);
                      }
                    } catch (err) {
                      console.log('Clone cleanup error:', err);
                    }

                    // Check all canvases (body and pallu)
                    const canvases = document.querySelectorAll('canvas');

                    canvases.forEach(canvas => {
                      const rect = canvas.getBoundingClientRect();
                      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        // Dispatch custom event
                        const event = new CustomEvent('motifTouchDrop', {
                          detail: {
                            motif: motifData,
                            x: touch.clientX - rect.left,
                            y: touch.clientY - rect.top
                          }
                        });
                        canvas.dispatchEvent(event);
                      }
                    });

                    // Clean up listeners
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  };

                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchend', handleTouchEnd);
                }}
                className="aspect-square rounded-lg border-2 border-gray-200 hover:border-purple-400 bg-white p-2 cursor-pointer transition group active:scale-95"
                title={motif.name}
              >
                <img
                  src={motif.thumbnail}
                  alt={motif.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                <div className="text-xs text-center mt-1 text-gray-600 opacity-0 group-hover:opacity-100 transition truncate">
                  {motif.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MotifLibrary;

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
          <div className="grid grid-cols-3 gap-3">
            {motifs.map((motif) => (
              <div
                key={motif.id}
                draggable
                onDragStart={(e) => handleDragStart(e, motif)}
                className="aspect-square rounded-lg border-2 border-gray-200 hover:border-purple-400 bg-white p-2 cursor-move transition group"
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

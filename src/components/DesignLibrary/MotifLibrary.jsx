import { useState } from 'react';
import { ChevronDown, ChevronUp, Flower, Flower2, Leaf, Bird, Sparkles, Heart, Star, Sun, Moon, Zap } from 'lucide-react';

function MotifLibrary({ selectedMotifs, setSelectedMotifs }) {
  const [isOpen, setIsOpen] = useState(true);

  const motifs = [
    { id: 1, name: 'Floral', icon: Flower, color: 'text-pink-500' },
    { id: 2, name: 'Lotus', icon: Flower2, color: 'text-purple-500' },
    { id: 3, name: 'Paisley', icon: Leaf, color: 'text-green-500' },
    { id: 4, name: 'Peacock', icon: Bird, color: 'text-blue-500' },
    { id: 5, name: 'Sparkle', icon: Sparkles, color: 'text-yellow-500' },
    { id: 6, name: 'Heart', icon: Heart, color: 'text-red-500' },
    { id: 7, name: 'Star', icon: Star, color: 'text-amber-500' },
    { id: 8, name: 'Sun', icon: Sun, color: 'text-orange-500' },
    { id: 9, name: 'Moon', icon: Moon, color: 'text-indigo-500' },
    { id: 10, name: 'Zari', icon: Zap, color: 'text-yellow-600' },
  ];

  const handleMotifClick = (motifId) => {
    if (selectedMotifs.includes(motifId)) {
      setSelectedMotifs(selectedMotifs.filter(id => id !== motifId));
    } else {
      setSelectedMotifs([...selectedMotifs, motifId]);
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
        <div className="p-4 pt-0 grid grid-cols-5 gap-2">
          {motifs.map((motif) => {
            const IconComponent = motif.icon;
            const isSelected = selectedMotifs.includes(motif.id);
            
            return (
              <button
                key={motif.id}
                onClick={() => handleMotifClick(motif.id)}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center transition ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                title={motif.name}
              >
                <IconComponent className={`w-6 h-6 ${motif.color}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MotifLibrary;

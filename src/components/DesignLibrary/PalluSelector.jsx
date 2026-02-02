import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function PalluSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(1);

  const palluOptions = [
    { id: 1, name: 'Traditional', pattern: 'repeating-linear-gradient(45deg, #EC4899 0px, #EC4899 10px, #F472B6 10px, #F472B6 20px)' },
    { id: 2, name: 'Modern', pattern: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' },
    { id: 3, name: 'Elegant', pattern: 'radial-gradient(circle at 30% 50%, #EC4899 0%, #F472B6 50%, #EC4899 100%)' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Pallu Selector</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-full">
          {palluOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`aspect-square rounded-lg border-2 transition ${selected === option.id
                ? 'border-purple-600 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div
                className="h-full w-full rounded-md"
                style={{ background: option.pattern }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PalluSelector;

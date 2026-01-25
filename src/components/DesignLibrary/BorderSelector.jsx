import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function BorderSelector() {
  const [isOpen, setIsOpen] = useState(true);
  const [selected, setSelected] = useState(1);

  const borderOptions = [
    { id: 1, name: 'Thin Gold', pattern: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)' },
    { id: 2, name: 'Wide Zari', pattern: 'repeating-linear-gradient(0deg, #F59E0B 0px, #FCD34D 5px, #F59E0B 10px)' },
    { id: 3, name: 'Decorative', pattern: 'radial-gradient(circle at 50% 50%, #F59E0B 0%, #D97706 100%)' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Border Selector</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 grid grid-cols-3 gap-3">
          {borderOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`h-20 rounded-lg border-2 transition ${
                selected === option.id
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

export default BorderSelector;

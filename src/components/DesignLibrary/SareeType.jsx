import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function SareeType({ sareeType, setSareeType }) {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    { id: 'nivi', name: 'Nivi', description: 'Most common' },
    { id: 'bengali', name: 'Bengali', description: 'Atpoure style' },
    { id: 'gujarati', name: 'Gujarati', description: 'Seedha pallu' },
    { id: 'south', name: 'South Indian', description: 'Madisaar style' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Saree Type</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-2">
          {types.map((type) => (
            <label
              key={type.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${sareeType === type.id
                ? 'bg-purple-50 border-2 border-purple-600'
                : 'border-2 border-transparent hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name="sareeType"
                value={type.id}
                checked={sareeType === type.id}
                onChange={(e) => setSareeType(e.target.value)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className={`font-medium ${sareeType === type.id ? 'text-purple-900' : 'text-gray-800'
                  }`}>{type.name}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default SareeType;

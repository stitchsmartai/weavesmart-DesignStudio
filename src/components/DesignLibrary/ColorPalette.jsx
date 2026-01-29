import { useState } from 'react';
import { ChevronDown, ChevronUp, Pipette } from 'lucide-react';

function ColorPalette({
  bodyColor,
  setBodyColor,
  borderColor,
  setBorderColor,
  palluColor,
  setPalluColor,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Color Palette</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {/* Border Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <Pipette className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#F59E0B"
              />
            </div>
          </div>

          {/* Body Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="color"
                  value={bodyColor}
                  onChange={(e) => setBodyColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <Pipette className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={bodyColor}
                onChange={(e) => setBodyColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#DC2626"
              />
            </div>
          </div>

          {/* Pallu Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pallu Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="color"
                  value={palluColor}
                  onChange={(e) => setPalluColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <Pipette className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={palluColor}
                onChange={(e) => setPalluColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#EC4899"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPalette;

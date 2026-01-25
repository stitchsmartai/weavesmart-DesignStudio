import { RotateCcw, Trash2 } from 'lucide-react';

function SareeCanvas({ bodyColor, borderColor, palluColor, selectedSection, setSelectedSection }) {
  const handleReset = () => {
    if (confirm('Reset design to defaults?')) {
      // This would reset colors in parent component
      alert('Reset functionality (dummy action)');
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Saree Visualization - 3 Sections */}
          <div className="aspect-[2/3] flex flex-col rounded-xl overflow-hidden border-4 border-gray-200">
            {/* Pallu Section (15%) */}
            <button
              onClick={() => setSelectedSection('pallu')}
              className={`flex-[15] transition-all duration-200 relative group ${
                selectedSection === 'pallu' ? 'ring-4 ring-purple-600 ring-inset' : ''
              }`}
              style={{ backgroundColor: palluColor }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition">
                  PALLU
                </span>
              </div>
              {selectedSection === 'pallu' && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Selected
                </div>
              )}
            </button>

            {/* Body Section (70%) */}
            <button
              onClick={() => setSelectedSection('body')}
              className={`flex-[70] transition-all duration-200 relative group ${
                selectedSection === 'body' ? 'ring-4 ring-purple-600 ring-inset' : ''
              }`}
              style={{ backgroundColor: bodyColor }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition">
                  BODY
                </span>
              </div>
              {selectedSection === 'body' && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Selected
                </div>
              )}
            </button>

            {/* Border Section (15%) */}
            <button
              onClick={() => setSelectedSection('border')}
              className={`flex-[15] transition-all duration-200 relative group ${
                selectedSection === 'border' ? 'ring-4 ring-purple-600 ring-inset' : ''
              }`}
              style={{ backgroundColor: borderColor }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition">
                  BORDER
                </span>
              </div>
              {selectedSection === 'border' && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Selected
                </div>
              )}
            </button>
          </div>

          {/* Canvas Info */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Selected Section: <span className="font-semibold text-gray-800 capitalize">{selectedSection}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Instructions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <p className="text-sm text-gray-600 text-center">
          💡 Click on the saree sections to select them, then use the color palette to customize
        </p>
      </div>
    </div>
  );
}

export default SareeCanvas;

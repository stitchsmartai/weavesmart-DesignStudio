import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Templates() {
  const [isOpen, setIsOpen] = useState(true);

  const templates = [
    { id: 1, name: 'Traditional Red', colors: ['#DC2626', '#F59E0B'] },
    { id: 2, name: 'Royal Blue', colors: ['#1E40AF', '#FCD34D'] },
    { id: 3, name: 'Golden Elegance', colors: ['#F59E0B', '#DC2626'] },
  ];

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800">Templates</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 grid grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-600 transition group"
            >
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${template.colors[0]} 0%, ${template.colors[1]} 100%)`,
                }}
              >
                <div className="h-full w-full flex items-end p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <span className="text-xs font-medium text-white truncate">
                    {template.name}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Templates;

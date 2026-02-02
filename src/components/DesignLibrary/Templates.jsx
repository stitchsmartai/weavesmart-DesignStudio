import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Templates({ onTemplateSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: 'Traditional Red',
      bodyColor: '#DC2626',
      borderColor: '#F59E0B',
      palluColor: '#FFC0CB',
      gradient: ['#DC2626', '#F59E0B']
    },
    {
      id: 2,
      name: 'Royal Blue',
      bodyColor: '#1E40AF',
      borderColor: '#FCD34D',
      palluColor: '#E0E7FF',
      gradient: ['#1E40AF', '#FCD34D']
    },
    {
      id: 3,
      name: 'Golden Elegance',
      bodyColor: '#F59E0B',
      borderColor: '#DC2626',
      palluColor: '#FEF3C7',
      gradient: ['#F59E0B', '#DC2626']
    },
  ];

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template.id);
    onTemplateSelect({
      bodyColor: template.bodyColor,
      borderColor: template.borderColor,
      palluColor: template.palluColor,
    });
  };

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
        <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-full">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition group ${selectedTemplate === template.id
                ? 'border-purple-600 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-purple-400'
                }`}
            >
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${template.gradient[0]} 0%, ${template.gradient[1]} 100%)`,
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

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { checkSareeTypeCompatibility, getSareeTypeRules } from '../../utils/sareeValidator';

function SareeType({ sareeType, setSareeType, bodyCanvasRef, palluCanvasRef, currentGridSettings = {}, onIncompatibleChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    { id: 'nivi', name: 'Nivi', description: 'Most common' },
    { id: 'bengali', name: 'Bengali', description: 'Atpoure style' },
    { id: 'gujarati', name: 'Gujarati', description: 'Seedha pallu' },
    { id: 'south_indian', name: 'South Indian', description: 'Madisaar style' },
  ];

  const handleSareeTypeChange = (newType) => {
    if (newType === sareeType) return;

    // Get all motifs from both canvases
    const bodyObjects = bodyCanvasRef.current?.getObjects() || [];
    const palluObjects = palluCanvasRef.current?.getObjects() || [];

    // Extract motif info from Fabric.js objects
    const currentMotifs = [...bodyObjects, ...palluObjects]
      .map(obj => ({
        id: obj.motifId, // Custom property set when creating motifs
        fabricObject: obj,
        section: bodyObjects.includes(obj) ? 'body' : 'pallu'
      }))
      .filter(m => m.id); // Only include objects with motifId

    console.log('🔍 Canvas motifs found:', currentMotifs.length, currentMotifs.map(m => m.id));

    // Validate compatibility
    const compatibility = checkSareeTypeCompatibility(
      newType,
      currentMotifs,
      currentGridSettings
    );

    console.log('✅ Compatibility result:', compatibility);

    if (compatibility.isCompatible) {
      // Compatible - switch immediately
      setSareeType(newType);
    } else {
      // Incompatible - show confirmation dialog
      const typeName = types.find(t => t.id === newType)?.name || newType;
      let message = `Switching to ${typeName} saree type will cause the following issues:\n\n`;

      if (compatibility.incompatibleMotifs.length > 0) {
        message += `• ${compatibility.incompatibleMotifs.length} incompatible motif(s) will be removed\n`;
      }

      if (compatibility.gridViolations.length > 0) {
        message += `• Grid violations:\n`;
        compatibility.gridViolations.forEach(violation => {
          message += `  - ${violation}\n`;
        });
      }

      message += `\nDo you want to continue?`;

      const confirmed = window.confirm(message);

      if (confirmed) {
        // Remove incompatible motifs from canvases
        compatibility.incompatibleMotifs.forEach(motif => {
          console.log(`🗑️ Removing incompatible motif: ${motif.id} from ${motif.section}`);
          if (motif.section === 'body') {
            bodyCanvasRef.current?.removeObject(motif.fabricObject);
          } else {
            palluCanvasRef.current?.removeObject(motif.fabricObject);
          }
        });

        // Switch to new saree type
        setSareeType(newType);

        // Notify parent to handle grid adjustments
        if (onIncompatibleChange) {
          onIncompatibleChange({
            newType,
            incompatibleMotifs: compatibility.incompatibleMotifs,
            gridViolations: compatibility.gridViolations
          });
        }
      }
      // If not confirmed, do nothing (stay on current type)
    }
  };

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
                onChange={(e) => handleSareeTypeChange(e.target.value)}
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

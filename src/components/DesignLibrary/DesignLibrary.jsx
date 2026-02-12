import { useState } from 'react';
import Templates from './Templates';
import SareeType from './SareeType';
import MotifLibrary from './MotifLibrary';
import PalluSelector from './PalluSelector';
import BorderSelector from './BorderSelector';
import ColorPalette from './ColorPalette';
import PatternMode from './PatternMode';
import Tassels from './Tassels';
import { getSareeTypeRules } from '../../utils/sareeValidator';

function DesignLibrary({
  bodyColor,
  setBodyColor,
  borderColor,
  setBorderColor,
  palluColor,
  setPalluColor,
  sareeType,
  setSareeType,
  selectedMotifs,
  setSelectedMotifs,
  bodyPatternSettings,
  setBodyPatternSettings,
  palluPatternSettings,
  setPalluPatternSettings,
  tasselSettings,
  setTasselSettings,
  bodyCanvasRef,
  palluCanvasRef,
}) {
  const handleTemplateSelect = (colors) => {
    setBodyColor(colors.bodyColor);
    setBorderColor(colors.borderColor);
    setPalluColor(colors.palluColor);
  };

  // Handle incompatible saree type changes
  const handleIncompatibleSareeTypeChange = ({ newType, incompatibleMotifs, gridViolations }) => {
    // Remove incompatible motifs
    if (incompatibleMotifs.length > 0) {
      const incompatibleIds = incompatibleMotifs.map(m => m.id);
      setSelectedMotifs(selectedMotifs.filter(m => !incompatibleIds.includes(m.id)));
    }

    // Adjust grid settings if needed (auto-adjust to fit new saree type limits)
    if (gridViolations.length > 0) {
      const rules = getSareeTypeRules(newType);

      // Adjust body grid if needed
      if (rules?.gridLimits?.body) {
        const bodyLimits = rules.gridLimits.body;
        setBodyPatternSettings({
          ...bodyPatternSettings,
          rows: Math.min(bodyPatternSettings.rows, bodyLimits.maxRows),
          cols: Math.min(bodyPatternSettings.cols, bodyLimits.maxCols)
        });
      }

      // Adjust pallu grid if needed
      if (rules?.gridLimits?.pallu) {
        const palluLimits = rules.gridLimits.pallu;
        setPalluPatternSettings({
          ...palluPatternSettings,
          rows: Math.min(palluPatternSettings.rows, palluLimits.maxRows),
          cols: Math.min(palluPatternSettings.cols, palluLimits.maxCols)
        });
      }
    }
  };

  return (
    <div className="w-72 md:w-96 bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden">
      <div className="p-4 md:p-6 space-y-6 max-w-full">
        <h2 className="text-lg font-bold text-gray-800">Design Library</h2>

        <Templates onTemplateSelect={handleTemplateSelect} />
        <SareeType
          sareeType={sareeType}
          setSareeType={setSareeType}
          bodyCanvasRef={bodyCanvasRef}
          palluCanvasRef={palluCanvasRef}
          currentGridSettings={{ body: bodyPatternSettings, pallu: palluPatternSettings }}
          onIncompatibleChange={handleIncompatibleSareeTypeChange}
        />


        {/* Grid Settings for Both Canvases */}
        <PatternMode
          bodyPatternSettings={bodyPatternSettings}
          setBodyPatternSettings={setBodyPatternSettings}
          palluPatternSettings={palluPatternSettings}
          setPalluPatternSettings={setPalluPatternSettings}
          sareeType={sareeType}
        />


        <MotifLibrary
          selectedMotifs={selectedMotifs}
          setSelectedMotifs={setSelectedMotifs}
          onMotifDragStart={(motif) => console.log('Dragging:', motif.name)}
          sareeType={sareeType}
        />
        <PalluSelector />
        <BorderSelector />
        <ColorPalette
          bodyColor={bodyColor}
          setBodyColor={setBodyColor}
          borderColor={borderColor}
          setBorderColor={setBorderColor}
          palluColor={palluColor}
          setPalluColor={setPalluColor}
        />
        <Tassels
          tasselSettings={tasselSettings}
          setTasselSettings={setTasselSettings}
        />
      </div>
    </div>
  );
}

export default DesignLibrary;

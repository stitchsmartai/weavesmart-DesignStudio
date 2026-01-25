import { useState } from 'react';
import Templates from './Templates';
import SareeType from './SareeType';
import MotifLibrary from './MotifLibrary';
import PalluSelector from './PalluSelector';
import BorderSelector from './BorderSelector';
import ColorPalette from './ColorPalette';

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
}) {
  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-800">Design Library</h2>
        
        <Templates />
        <SareeType sareeType={sareeType} setSareeType={setSareeType} />
        <MotifLibrary selectedMotifs={selectedMotifs} setSelectedMotifs={setSelectedMotifs} />
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
      </div>
    </div>
  );
}

export default DesignLibrary;

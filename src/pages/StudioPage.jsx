import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Download, LogOut } from 'lucide-react';
import DesignLibrary from '../components/DesignLibrary/DesignLibrary';
import SareeCanvas from '../components/SareeCanvas/SareeCanvas';

function StudioPage() {
  const navigate = useNavigate();
  
  // Design state
  const [bodyColor, setBodyColor] = useState('#DC2626');
  const [borderColor, setBorderColor] = useState('#F59E0B');
  const [palluColor, setPalluColor] = useState('#EC4899');
  const [selectedSection, setSelectedSection] = useState('body');
  const [sareeType, setSareeType] = useState('nivi');
  const [selectedMotifs, setSelectedMotifs] = useState([]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSave = () => {
    alert('Design saved! (This is a dummy action)');
  };

  const handleExport = () => {
    alert('Exporting GLB file... (This is a dummy action)');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Saree Design Studio</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            <span className="font-medium">Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Design Library */}
        <DesignLibrary
          bodyColor={bodyColor}
          setBodyColor={setBodyColor}
          borderColor={borderColor}
          setBorderColor={setBorderColor}
          palluColor={palluColor}
          setPalluColor={setPalluColor}
          sareeType={sareeType}
          setSareeType={setSareeType}
          selectedMotifs={selectedMotifs}
          setSelectedMotifs={setSelectedMotifs}
        />

        {/* Right Panel - Saree Canvas */}
        <SareeCanvas
          bodyColor={bodyColor}
          borderColor={borderColor}
          palluColor={palluColor}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
      </div>
    </div>
  );
}

export default StudioPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Download, LogOut, Upload } from 'lucide-react';
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
  const [notification, setNotification] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Auto-save to localStorage
  useEffect(() => {
    const designState = {
      bodyColor,
      borderColor,
      palluColor,
      sareeType,
      selectedMotifs,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('saree-design', JSON.stringify(designState));
  }, [bodyColor, borderColor, palluColor, sareeType, selectedMotifs]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saree-design');
    if (saved) {
      try {
        const design = JSON.parse(saved);
        setBodyColor(design.bodyColor);
        setBorderColor(design.borderColor);
        setPalluColor(design.palluColor);
        setSareeType(design.sareeType);
        setSelectedMotifs(design.selectedMotifs || []);
      } catch (error) {
        console.error('Failed to load saved design:', error);
      }
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSave = () => {
    const designState = {
      bodyColor,
      borderColor,
      palluColor,
      sareeType,
      selectedMotifs,
      savedAt: new Date().toISOString(),
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(designState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saree-design-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Design saved successfully!');
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const design = JSON.parse(event.target.result);
            setBodyColor(design.bodyColor);
            setBorderColor(design.borderColor);
            setPalluColor(design.palluColor);
            setSareeType(design.sareeType);
            setSelectedMotifs(design.selectedMotifs || []);
            showNotification('Design loaded successfully!');
          } catch (error) {
            showNotification('Failed to load design file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const summary = `
Saree Design Summary
━━━━━━━━━━━━━━━━━━━━
Style: ${sareeType.charAt(0).toUpperCase() + sareeType.slice(1)}

Colors:
  • Body: ${bodyColor}
  • Border: ${borderColor}
  • Pallu: ${palluColor}

Motifs: ${selectedMotifs.length} placed

Generated: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
Ready for 3D export!
    `.trim();

    alert(summary);
    showNotification('Export information generated!');
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
            onClick={handleLoad}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <Upload className="w-4 h-4" />
            <span className="font-medium">Load</span>
          </button>
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

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
            }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Design Library */}
        <div
          className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-96'
            }`}
        >
          {!isSidebarCollapsed && (
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
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-4 ${isSidebarCollapsed ? 'left-4' : 'left-[22rem]'} z-30 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg transition-all duration-300`}
          title={isSidebarCollapsed ? 'Show Design Library' : 'Hide Design Library'}
        >
          {isSidebarCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

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

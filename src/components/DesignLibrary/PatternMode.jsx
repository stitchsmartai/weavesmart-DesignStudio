import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function PatternMode({ bodyPatternSettings, setBodyPatternSettings, palluPatternSettings, setPalluPatternSettings }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('body'); // 'body' or 'pallu'

    const patterns = [
        { id: 'all', name: 'All' },
        { id: 'checkerboard', name: 'Checker' },
        { id: 'diagonal', name: 'Diagonal' },
        { id: 'border', name: 'Border' },
        { id: 'odd-rows', name: 'Odd Rows' },
        { id: 'even-rows', name: 'Even Rows' },
        { id: 'odd-cols', name: 'Odd Cols' },
        { id: 'even-cols', name: 'Even Cols' },
    ];

    // Get current settings based on active tab
    const currentSettings = activeTab === 'body' ? bodyPatternSettings : palluPatternSettings;
    const setCurrentSettings = activeTab === 'body' ? setBodyPatternSettings : setPalluPatternSettings;

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
            >
                <span className="font-semibold text-gray-800 text-sm">Grid Settings</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="p-3 pt-0 space-y-3">
                    {/* Canvas Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 pb-2">
                        <button
                            onClick={() => setActiveTab('body')}
                            className={`flex-1 px-3 py-1.5 rounded-t text-xs font-medium transition ${activeTab === 'body'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Body Canvas
                        </button>
                        <button
                            onClick={() => setActiveTab('pallu')}
                            className={`flex-1 px-3 py-1.5 rounded-t text-xs font-medium transition ${activeTab === 'pallu'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pallu Canvas
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentSettings({ ...currentSettings, mode: 'free' })}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${currentSettings.mode === 'free'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Free
                        </button>
                        <button
                            onClick={() => setCurrentSettings({ ...currentSettings, mode: 'grid' })}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${currentSettings.mode === 'grid'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Grid
                        </button>
                    </div>

                    {/* Grid Settings (only show in grid mode) */}
                    {currentSettings.mode === 'grid' && (
                        <>
                            {/* Rows, Cols, Spacing */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">Rows</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={currentSettings.rows}
                                        onChange={(e) => setCurrentSettings({
                                            ...currentSettings,
                                            rows: parseInt(e.target.value) || 1
                                        })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">Cols</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={currentSettings.cols}
                                        onChange={(e) => setCurrentSettings({
                                            ...currentSettings,
                                            cols: parseInt(e.target.value) || 1
                                        })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">Gap</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={currentSettings.spacing}
                                        onChange={(e) => setCurrentSettings({
                                            ...currentSettings,
                                            spacing: parseInt(e.target.value) || 0
                                        })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Fill Pattern */}
                            <div>
                                <label className="text-xs text-gray-600 block mb-1.5">Pattern</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {patterns.map(pattern => (
                                        <button
                                            key={pattern.id}
                                            onClick={() => setCurrentSettings({
                                                ...currentSettings,
                                                pattern: pattern.id
                                            })}
                                            className={`px-2 py-1 rounded text-xs font-medium transition ${currentSettings.pattern === pattern.id
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pattern.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Compact Pattern Preview */}
                            <div className="bg-gray-50 p-2 rounded">
                                <div
                                    className="grid gap-0.5 mx-auto"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.min(currentSettings.cols, 6)}, 1fr)`,
                                        maxWidth: '120px'
                                    }}
                                >
                                    {Array.from({ length: Math.min(currentSettings.rows, 6) * Math.min(currentSettings.cols, 6) }).map((_, idx) => {
                                        const row = Math.floor(idx / Math.min(currentSettings.cols, 6));
                                        const col = idx % Math.min(currentSettings.cols, 6);
                                        const shouldFill = shouldFillCell(row, col, currentSettings.pattern, Math.min(currentSettings.rows, 6), Math.min(currentSettings.cols, 6));

                                        return (
                                            <div
                                                key={idx}
                                                className={`aspect-square rounded-sm ${shouldFill ? 'bg-purple-600' : 'bg-gray-200'
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Compact Info */}
                            <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                💡 Drop motif to fill • Changes update live
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper function to determine if a cell should be filled based on pattern
function shouldFillCell(row, col, pattern, totalRows, totalCols) {
    switch (pattern) {
        case 'all':
            return true;
        case 'checkerboard':
            return (row + col) % 2 === 0;
        case 'diagonal':
            return row === col || row + col === totalRows - 1;
        case 'border':
            return row === 0 || row === totalRows - 1 || col === 0 || col === totalCols - 1;
        case 'odd-rows':
            return row % 2 === 0;
        case 'even-rows':
            return row % 2 === 1;
        case 'odd-cols':
            return col % 2 === 0;
        case 'even-cols':
            return col % 2 === 1;
        default:
            return false;
    }
}

export default PatternMode;

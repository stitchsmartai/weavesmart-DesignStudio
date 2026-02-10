import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Tassels({ tasselSettings, setTasselSettings }) {
    const [isOpen, setIsOpen] = useState(false);

    const styles = [
        { id: 'simple', name: 'Simple Fringe' },
        { id: 'beaded', name: 'Beaded' },
        { id: 'twisted', name: 'Twisted' },
    ];

    const lengths = [
        { id: 'short', name: 'Short', value: 30 },
        { id: 'medium', name: 'Medium', value: 60 },
        { id: 'long', name: 'Long', value: 90 },
    ];

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
                <span className="font-semibold text-gray-800">Tassels</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Enable Tassels</label>
                        <button
                            onClick={() => setTasselSettings({ ...tasselSettings, enabled: !tasselSettings.enabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${tasselSettings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${tasselSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {tasselSettings.enabled && (
                        <>
                            {/* Color Picker */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Tassel Color
                                </label>
                                <input
                                    type="color"
                                    value={tasselSettings.color}
                                    onChange={(e) => setTasselSettings({ ...tasselSettings, color: e.target.value })}
                                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                />
                            </div>

                            {/* Style Dropdown */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Style
                                </label>
                                <select
                                    value={tasselSettings.style}
                                    onChange={(e) => setTasselSettings({ ...tasselSettings, style: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {styles.map(style => (
                                        <option key={style.id} value={style.id}>
                                            {style.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Length Slider */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Length: {lengths.find(l => l.value === tasselSettings.length)?.name || 'Medium'}
                                </label>
                                <input
                                    type="range"
                                    min="30"
                                    max="90"
                                    step="30"
                                    value={tasselSettings.length}
                                    onChange={(e) => setTasselSettings({ ...tasselSettings, length: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Short</span>
                                    <span>Medium</span>
                                    <span>Long</span>
                                </div>
                            </div>

                            {/* Preview Info */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-xs text-purple-800">
                                    💡 Tassels will appear on the right edge of the pallu section
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Tassels;

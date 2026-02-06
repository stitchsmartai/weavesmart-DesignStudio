import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, ArrowRight } from 'lucide-react';

function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const handleGoToStudio = () => {
        navigate('/studio');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">WeaveSmart</h1>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm md:text-base"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
                <div className="max-w-4xl w-full">
                    {/* Welcome Section */}
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                            Welcome to WeaveSmart
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            Design beautiful sarees with our intuitive design studio. Create, customize, and export your designs.
                        </p>
                    </div>

                    {/* Action Card */}
                    <div className="max-w-2xl mx-auto mb-8">
                        {/* Design Studio Card */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 md:p-8 border border-gray-200">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                Design Studio
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                                Create and customize saree designs with our powerful design tools
                            </p>
                            <button
                                onClick={handleGoToStudio}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
                            >
                                <span>Open Studio</span>
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-200">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                            Features
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Color Customization</h4>
                                <p className="text-xs md:text-sm text-gray-600">Choose from unlimited colors for body, border, and pallu</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Motif Library</h4>
                                <p className="text-xs md:text-sm text-gray-600">Drag and drop beautiful motifs onto your design</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Grid Patterns</h4>
                                <p className="text-xs md:text-sm text-gray-600">Create repeating patterns with customizable grids</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Save & Load</h4>
                                <p className="text-xs md:text-sm text-gray-600">Save your designs and load them anytime</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Responsive Design</h4>
                                <p className="text-xs md:text-sm text-gray-600">Works seamlessly on desktop, tablet, and mobile</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">Real-time Preview</h4>
                                <p className="text-xs md:text-sm text-gray-600">See your changes instantly as you design</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto text-center text-xs md:text-sm text-gray-600">
                    <p>© 2026 WeaveSmart Design Studio. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;

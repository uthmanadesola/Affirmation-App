import { createRoute, type AnyRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Gradient
const gradientOptions = [
    { name: 'Pink Sunset', value: 'from-pink-400 via-yellow-500 to-red-500' },
    { name: 'Ocean Blue', value: 'from-blue-400 via-cyan-500 to-teal-500' },
    { name: 'Purple Dream', value: 'from-purple-400 via-pink-500 to-red-500' },
    { name: 'Forest Green', value: 'from-green-400 via-emerald-500 to-teal-500' },
    { name: 'Golden Hour', value: 'from-yellow-400 via-orange-500 to-red-500' },
    { name: 'Electric Violet', value: 'from-purple-500 via-pink-600 to-blue-600' },
    { name: 'Neon Sunset', value: 'from-orange-500 via-pink-600 to-purple-700' },
    { name: 'Cyberpunk', value: 'from-cyan-400 via-blue-500 to-purple-600' },
    { name: 'Tropical Punch', value: 'from-red-400 via-orange-500 to-yellow-400' },
    { name: 'Synthwave', value: 'from-pink-500 via-purple-600 to-blue-500' },
    { name: 'Voltage', value: 'from-green-300 via-blue-400 to-purple-600' },
    { name: 'Autumn Leaves', value: 'from-amber-500 via-orange-600 to-red-700' },
    { name: 'Forest Canopy', value: 'from-green-600 via-emerald-700 to-teal-800' },
    { name: 'Desert Sand', value: 'from-amber-300 via-orange-400 to-yellow-600' },
    { name: 'Ocean Depth', value: 'from-blue-600 via-indigo-700 to-purple-900' },
    { name: 'Mountain Sunset', value: 'from-purple-600 via-pink-700 to-red-800' },
    { name: 'Spring Meadow', value: 'from-green-300 via-emerald-400 to-teal-500' },
    { name: 'Sunrise', value: 'from-yellow-200 via-orange-300 to-pink-400' },
    { name: 'Midnight Sky', value: 'from-indigo-900 via-purple-900 to-pink-900' },
    { name: 'Coral Reef', value: 'from-pink-400 via-rose-500 to-orange-500' },
    { name: 'Lemon Lime', value: 'from-lime-300 via-green-400 to-emerald-500' },
    { name: 'Tropical Ocean', value: 'from-cyan-300 via-teal-400 to-blue-500' },
    { name: 'Deep Tech', value: 'from-slate-800 via-gray-900 to-zinc-950' },
    { name: 'Midnight Blue', value: 'from-blue-900 via-indigo-950 to-violet-950' },
    { name: 'Graphite', value: 'from-zinc-800 via-neutral-900 to-stone-950' },
    { name: 'Steel Gradient', value: 'from-slate-700 via-gray-800 to-zinc-900' },
    { name: 'Ocean Depth', value: 'from-blue-800 via-indigo-900 to-blue-950' },
    { name: 'Charcoal', value: 'from-gray-800 via-gray-900 to-black' },

   
];

export default (parent: AnyRoute) => createRoute({
    path: '/settingsPanel',
    getParentRoute: () => parent,
    component: SettingsPanelComponent,
})

// Export function to get current gradient
export function getGradient(): string {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        return settings.gradientColor || gradientOptions[0].value;
    }
    return gradientOptions[0].value;
}

export function SettingsPanelComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, isAuthenticated, user } = useAuth();
    const [settings, setSettings] = useState(() => {
        
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            aiEnabled: false,
            gradientColor: gradientOptions[0].value,
            notificationsEnabled: true,
        };
    });

    // Save to localStorage when settings change
    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        // Triggering a custom event so other components can react to the settings change
        window.dispatchEvent(new Event('settingsChanged'));
    }, [settings]);
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full p-3 transition-all duration-300 z-40"
            >
                Open Settings
            </button>
            {isOpen && (
                <div className="fixed top-16 right-0 w-1/3 h-[calc(100%-4rem)] bg-white/10 backdrop-blur-lg rounded-l-lg p-4 transition-all duration-300 z-40">
                    <h2 className="text-2xl font-bold mb-4 text-white">Settings</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-white/90"
                    >
                        X
                    </button>

                    <div className="flex items-center justify-between py-3 border-b border-white/20">
                        <div>
                        <p className="text-sm font-medium text-white">AI Affirmations</p>
                        <p className="text-xs text-white/70">Enable AI-generated affirmations</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, aiEnabled: !settings.aiEnabled })}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.aiEnabled ? 'bg-green-500' : 'bg-white/30'}`}
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.aiEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-white/20">
                        <div>
                            <p className="text-sm font-medium text-white">Notifications</p>
                            <p className="text-xs text-white/70">Daily Reminder</p>
                        </div>
                        <button
                            onClick={() =>
                                setSettings({
                                    ...settings,
                                    notificationsEnabled: !settings.notificationsEnabled,
                                })
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-green-500' : 'bg-white/30'}`}
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                            />
                        </button>
                    </div>

                    {}
                    <div className="py-3 border-b border-white/20">
                        <p className="text-sm font-medium text-white mb-2">Theme Color</p>
                        <div className="grid grid-cols-5 gap-2">
                            {gradientOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => setSettings({ ...settings, gradientColor: option.value })}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${option.value} ${
                                        settings.gradientColor === option.value ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                                    }`}
                                    title={option.name}
                                />
                            ))}
                        </div>
                    </div>

                    {}
                    {isAuthenticated && (
                        <div className="mt-6 pt-4 border-t border-white/20">
                            <p className="text-sm text-white/70 mb-2">
                                Logged in as <span className="text-white font-medium">{user?.name || user?.email}</span>
                            </p>
                            <button 
                                onClick={() => { logout(); window.location.href = '/'; }} 
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
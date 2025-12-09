import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getGradient } from "../pages/settingsPanel";

export default function NavigationBar() {
    const {isAuthenticated, user, logout} = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [gradient, setGradient] = useState(getGradient());

    // Listen for theme changes
    useEffect(() => {
        const handleSettingsChange = () => setGradient(getGradient());
        window.addEventListener('settingsChanged', handleSettingsChange);
        return () => window.removeEventListener('settingsChanged', handleSettingsChange);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const navLinkClass = (path: string) => `px-3 py-2 rounded-lg transition-colors ${
        isActive(path) 
            ? 'bg-white/20 text-white font-semibold' 
            : 'text-white/80 hover:text-white hover:bg-white/10'
    }`;

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* LEFT: Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <span className="text-xl font-bold text-white">Daily Affirmations</span>
                    </Link>

                    {/* CENTER: Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/affirmation" className={navLinkClass('/affirmation')}>Affirmations</Link>
                                <Link to="/blog/article" className={navLinkClass('/blog/article')}>Blog</Link>
                            </>
                        )}
                    </div>

                    {/* RIGHT: Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-white/90 text-sm">
                                    Hi, <span className="font-medium">{user?.name || user?.email}</span>
                                </span>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-white hover:text-white/80 transition-colors">
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="px-4 py-2 rounded-lg bg-white text-pink-600 font-medium hover:bg-white/90 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/20 py-4">
                        <div className="flex flex-col gap-3">
                            <Link to="/" className={navLinkClass('/')} onClick={() => setIsMenuOpen(false)}>
                                Home
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link to="/affirmation" className={navLinkClass('/affirmation')} onClick={() => setIsMenuOpen(false)}>
                                        Affirmations
                                    </Link>
                                    <Link to="/blog/article" className={navLinkClass('/blog/article')} onClick={() => setIsMenuOpen(false)}>
                                        Blog
                                    </Link>
                                </>
                            )}
                            <div className="border-t border-white/20 pt-3 mt-2">
                                {isAuthenticated ? (
                                    <>
                                        <p className="text-white/70 text-sm mb-2">
                                            Logged in as {user?.name || user?.email}
                                        </p>
                                        <button 
                                            onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                                            className="text-red-200 hover:text-red-100"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link to="/login" className="text-white" onClick={() => setIsMenuOpen(false)}>
                                            Login
                                        </Link>
                                        <Link to="/signup" className="text-white font-medium" onClick={() => setIsMenuOpen(false)}>
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );












}
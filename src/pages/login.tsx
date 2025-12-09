import { createRoute, Link, type AnyRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default (parent: AnyRoute) => createRoute({
    path: '/login',
    getParentRoute: () => parent,
    component: LoginPage,
})

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) { 
                const data = await response.json();
                login(data.token, data.user);
                window.location.href = '/affirmation';
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed, please try again');
            }
        } catch (error) {
            console.error('Login error', error);
            setError('Oops! Something went wrong, could not login');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-500 to-red-500 text-white flex flex-col items-center justify-center p-5">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-shadow-lg">
            Login to Your Affirmation App
            </h1>
            <p className="text-xl mb-8 text-center opacity-90">
                Enter your email and password to login
                </p>
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 rounded-md bg-white text-pink-600 font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                        {isLoading ? 'Logging you in............' : 'Login'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
                <p className="text-sm mt-4 text-center opacity-70">
                    Don't have an account? <Link to="/signup" className="text-white hover:text-white/90">Sign up</Link>
                </p>
            </div>
    );
}
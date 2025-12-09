import { createRoute, Link, type AnyRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default (parent: AnyRoute) => createRoute({
    path: '/signup',
    getParentRoute: () => parent,
    component: SignupPage,
})

function SignupPage() {
    const [name, setName] = useState("");
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
            const response = await fetch('http://localhost:3001/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password})
            });
            if (response.ok) {
                const data = await response.json();
                login(data.token, data.user);
                window.location.href = '/affirmation';
                    } else {
                        const errorData = await response.json();
                        setError(errorData.message || 'Signup failed, please check your information and try again');
                    }
                } catch (error) {
                    console.error('Signup error', error);
                    setError('Something went wrong, could not sign up');
                }
                finally {
                    setIsLoading(false);
                }
            };
    return (
        <div className="flex flex-col gap-4">
            <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-500 to-red-500 text-white flex flex-col items-center justify-center p-5">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-shadow-lg">
                    Create Your Account
                    </h1>
                    <p className="text-xl mb-8 text-center opacity-90">
                        Enter your name, email, and password to create your account
                    </p>
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value) } className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value) } className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value) } className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" />
                        </div>

                    <button type="submit" className="w-full py-2 px-4 rounded-md bg-white text-pink-600 font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                        {isLoading ? 'Creating your account............' : 'Create Account'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </form>
                
                    <p className="text-sm mt-4 text-center opacity-70">
                        Already have an account? <Link to="/login" className="text-white hover:text-white/90">Login</Link>
                    </p>
            </div>
        </div>
    );
}
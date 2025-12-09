import { createRoute, Link, type AnyRoute } from "@tanstack/react-router";

export default (parent: AnyRoute) => createRoute({
  path: '/',
  getParentRoute: () => parent,
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-500 to-red-500 text-white flex flex-col items-center justify-center p-5">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-shadow-lg">
        Your Daily Dose of Positivity
        </h1>
        <p className="text-xl mb-8 text-center opacity-90">
          Welcome to the home page, get personalized affirmations just for YOU
          </p>

          <div className="flex gap-4">
            <Link to="/login" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-all">
            Login
            </Link>
            <Link to="/signup" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-all">
            Signup
            </Link>
          </div>
    </div>
  );
}


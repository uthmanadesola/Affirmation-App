import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import affirmation from "./affirmation";
import login from "./login";
import signup from "./signup";
import logout from "./logout";
import home from "./home";
import settingsPanel from "./settingsPanel";
import { createTree } from "../router";
import blog from "./blog";
import NavBar from "../components/navigationBar";

// Root layout component that wraps all pages
function RootLayout() {
  return (
    <>
      <NavBar />
      {}
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-500 to-red-500 flex flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found!</p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-white text-pink-600 rounded-full font-semibold hover:bg-white/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  },
});

export const routeTree = createTree(rootRoute, affirmation, login, logout, signup, settingsPanel, home, blog);
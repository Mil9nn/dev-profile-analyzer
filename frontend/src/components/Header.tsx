import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isActivePage, setIsActivePage] = useState("Home");

  // Auto-set active tab based on path
  useEffect(() => {
    if (location.pathname === "/") setIsActivePage("Home");
    else if (location.pathname.includes("analysis")) setIsActivePage("Analysis");
    else if (location.pathname.includes("resume")) setIsActivePage("Resume");
    else if (location.pathname.includes("about")) setIsActivePage("About");
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Analysis", path: "/analysis" },
    { name: "Resume", path: "/resume" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="bg-zinc-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-purple-400">
              DevProfile
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm relative">
              {navItems.map(({ name, path }) => (
                <Link
                  key={name}
                  to={path}
                  onClick={() => setIsActivePage(name)}
                  className="relative hover:text-purple-400 transition-colors duration-300"
                >
                  {name}
                  {isActivePage === name && (
                    <div className="absolute bottom-[-22px] left-1/2 -translate-x-1/2 w-[50px] h-0.5 bg-purple-500 rounded-full transition-all duration-300 ease-in-out"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 bg-purple-600 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full text-sm bg-white text-purple-700 font-semibold hover:bg-purple-100 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-purple-400"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-zinc-800">
          {navItems.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              className="block hover:text-purple-400"
              onClick={() => {
                setIsActivePage(name);
                setIsOpen(false);
              }}
            >
              {name}
            </Link>
          ))}

          <div className="pt-2 flex items-center gap-5 border-t border-zinc-700">
            <Link
              to="/login"
              className="text-left py-2 text-sm hover:bg-zinc-700 rounded px-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-left py-2 text-sm bg-purple-600 rounded-full px-4 mt-1 hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

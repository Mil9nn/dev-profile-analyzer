import { Menu } from "lucide-react"

export default function Navbar() {
  return (
    <header className="sticky inset-0 z-50 border-b border-slate-100 bg-black/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4 transition-all duration-200 ease-in-out lg:px-12">
        
        {/* Logo */}
        <div className="relative flex items-center">
          <a href="/">
            <img
              src="https://www.svgrepo.com/show/499831/target.svg"
              loading="lazy"
              width="32"
              height="32"
              alt="Logo"
              style={{ color: "transparent" }}
            />
          </a>
        </div>

        {/* Center Nav Links */}
        <ul className="hidden items-center justify-center gap-6 md:flex">
          <li className="pt-1.5 font-dm text-sm font-medium text-slate-200">
            <a href="#">Pricing</a>
          </li>
          <li className="pt-1.5 font-dm text-sm font-medium text-slate-200">
            <a href="#">Blog</a>
          </li>
          <li className="pt-1.5 font-dm text-sm font-medium text-slate-200">
            <a href="#">Docs</a>
          </li>
        </ul>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Auth Links */}
        <div className="hidden items-center justify-center gap-6 md:flex">
          <a href="#" className="font-dm text-sm font-medium text-slate-200">
            Sign in
          </a>
          <a
            href="#"
            className="rounded-md bg-gradient-to-br from-green-600 to-emerald-400 px-3 py-1.5 font-dm text-sm font-medium text-white shadow-md shadow-green-400/50 transition-transform duration-200 ease-in-out hover:scale-[1.03]"
          >
            Sign up for free
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="relative flex items-center justify-center md:hidden">
          <button type="button">
            <Menu className="h-6 w-auto text-slate-900" />
          </button>
        </div>
      </nav>
    </header>
  )
}

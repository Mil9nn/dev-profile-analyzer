import { Menu, Target } from "lucide-react"

export default function Navbar() {
  return (
    <header className="sticky inset-0 z-50 bg-zinc-950 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4 transition-all duration-200 ease-in-out lg:px-12">

        {/* Logo */}
        <div className="relative flex items-center">
          <a href="/">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#965bff] rounded-full text-sm text-slate-300 backdrop-blur-sm border border-white/20">
              <Target className="size-5" />
              <code className="flex items-center text-white font-mono text-base">
                <span className="text-black font-bold text-lg">&lt;</span>
                <span className="text-white">DevProfile Analyzer</span>
                <span className="text-black font-bold text-lg"> /&gt;</span>
              </code>
            </div>
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
            className="rounded-md px-3 py-1.5 font-dm text-sm font-medium text-white shadow-md shadow-purple-400/80 transition-transform duration-200 ease-in-out hover:scale-[1.05]"
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

import { GraduationCap, BookOpen, Home, LogIn, UserPlus } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <GraduationCap className="text-blue-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold">Glingo</h1>
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10"
            >
              <Home size={18} />
              Início
            </a>
            <a
              href="/turmas"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10"
            >
              <BookOpen size={18} />
              Cursos
            </a>
            <div className="w-px h-6 bg-white/30 mx-2"></div>
            <a
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10"
            >
              <LogIn size={18} />
              Entrar
            </a>
            <a
              href="/cadastro"
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-md"
            >
              <UserPlus size={18} />
              Cadastrar
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

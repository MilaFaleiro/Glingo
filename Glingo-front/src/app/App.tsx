import { useState } from "react";
import { GraduationCap, BookOpen, Home, LogIn, UserPlus, User, LogOut, ClipboardList, MessageSquare } from "lucide-react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ClassesListing from "./components/ClassesListing";
import SupportChat from "./components/SupportChat";
import AdminDashboard from "./components/AdminDashboard";
import ProfilePage from "./components/ProfilePage";
import StudentDashboard from "./components/StudentDashboard";
import EnrollmentWizard from "./components/EnrollmentWizard";
import NotFound from "./components/NotFound";
import type { Aluno, Professor } from "../services/api";

type Page = "home" | "auth" | "register" | "classes" | "matricula" | "support" | "admin" | "profile" | "student" | "404";

const languages = [
  { flag: "🇺🇸", name: "Inglês", status: "Vagas abertas", type: "open" },
  { flag: "🇪🇸", name: "Espanhol", status: "Vagas abertas", type: "open" },
  { flag: "🇧🇷", name: "Português", status: "Últimas vagas", type: "last" },
  { flag: "🇨🇳", name: "Mandarim", status: "Vagas abertas", type: "open" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [aluno, setAluno] = useState<Aluno | null>(() => {
    const raw = sessionStorage.getItem("aluno");
    return raw ? JSON.parse(raw) : null;
  });
  const [professor, setProfessor] = useState<Professor | null>(() => {
    const raw = sessionStorage.getItem("professor");
    return raw ? JSON.parse(raw) : null;
  });

  const handleLoginSuccess = (user: Aluno | Professor, tipo: "aluno" | "professor") => {
    if (tipo === "professor") {
      setProfessor(user as Professor);
      setAluno(null);
      setCurrentPage("admin");
    } else {
      setAluno(user as Aluno);
      setProfessor(null);
      setCurrentPage("student");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("aluno");
    sessionStorage.removeItem("professor");
    setAluno(null);
    setProfessor(null);
    setCurrentPage("home");
  };

  const handleAtualizarAluno = (novoAluno: Aluno) => {
    setAluno(novoAluno);
    sessionStorage.setItem("aluno", JSON.stringify(novoAluno));
  };

  if (professor && currentPage === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const nomeUsuario = aluno?.nome;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentPage(aluno ? "student" : "home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <GraduationCap className="text-blue-600" size={24} />
              </div>
              <h1 className="text-2xl font-bold">Glingo</h1>
            </button>

            <nav className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(aluno ? "student" : "home")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                <Home size={18} /> Início
              </button>
              <button onClick={() => setCurrentPage("classes")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                <BookOpen size={18} /> Cursos
              </button>
              {aluno && (
                <>
                  <button onClick={() => setCurrentPage("matricula")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                    <ClipboardList size={18} /> Matrícula
                  </button>
                  <button onClick={() => setCurrentPage("support")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                    <MessageSquare size={18} /> Atendimento
                  </button>
                </>
              )}

              <div className="w-px h-6 bg-white/30 mx-2" />

              {nomeUsuario ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage("student")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                    <User size={18} /> {nomeUsuario.split(" ")[0]}
                  </button>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-md">
                    <LogOut size={18} /> Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage("auth")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white/10">
                    <LogIn size={18} /> Entrar
                  </button>
                  <button onClick={() => setCurrentPage("register")}
                    className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-md">
                    <UserPlus size={18} /> Cadastrar
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">

        {/* HOME */}
        {currentPage === "home" && (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-3xl p-14 mb-14 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-5 select-none pointer-events-none">🌍</div>
              <h2 className="text-5xl font-bold mb-4 relative">Aprenda um idioma novo</h2>
              <p className="text-xl opacity-90 mb-8 relative">Inglês · Espanhol · Português · Mandarim</p>
              <div className="flex gap-4 justify-center relative">
                <button onClick={() => setCurrentPage("register")}
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:scale-105">
                  Começar agora
                </button>
                <button onClick={() => setCurrentPage("auth")}
                  className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Já tenho conta
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nossos cursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {languages.map((lang) => (
                <div key={lang.name} onClick={() => setCurrentPage("classes")}
                  className="group bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-blue-300 hover:-translate-y-1 cursor-pointer">
                  <div className="text-6xl group-hover:scale-110 transition-transform">{lang.flag}</div>
                  <h4 className="font-bold text-xl text-gray-900">{lang.name}</h4>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border flex items-center gap-1 ${
                    lang.type === "open" ? "bg-green-50 border-green-200 text-green-700" : "bg-orange-50 border-orange-200 text-orange-700"
                  }`}>
                    {lang.type === "open" ? "✓" : "⚠"} {lang.status}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setCurrentPage("classes")}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-md text-lg">
              Ver todas as turmas →
            </button>
          </>
        )}

        {/* PAINEL DO ESTUDANTE */}
        {currentPage === "student" && aluno && (
          <StudentDashboard
            aluno={aluno}
            onEditar={() => setCurrentPage("profile")}
            onNovaMatricula={() => setCurrentPage("matricula")}
            onAtendimento={() => setCurrentPage("support")}
          />
        )}

        {currentPage === "auth" && (
          <div className="max-w-md mx-auto">
            <LoginForm onLoginSuccess={handleLoginSuccess} onCadastrar={() => setCurrentPage("register")} />
          </div>
        )}

        {currentPage === "register" && (
          <div className="max-w-md mx-auto">
            <RegisterForm onSucesso={() => setCurrentPage("auth")} />
            <p className="text-center text-gray-500 text-sm mt-4">
              Já tem conta?{" "}
              <button onClick={() => setCurrentPage("auth")} className="text-blue-600 font-semibold hover:underline">
                Fazer login
              </button>
            </p>
          </div>
        )}

        {currentPage === "classes" && (
          <>
            {!aluno && !professor && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <p className="text-blue-800 text-sm">Faça login para se matricular nas turmas.</p>
                <button onClick={() => setCurrentPage("auth")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Entrar
                </button>
              </div>
            )}
            <ClassesListing />
          </>
        )}

        {currentPage === "matricula" && (
          <EnrollmentWizard onConcluido={() => setCurrentPage("student")} />
        )}

        {currentPage === "support" && <SupportChat />}

        {currentPage === "profile" && aluno && (
          <ProfilePage aluno={aluno} onAtualizar={handleAtualizarAluno} />
        )}

        {currentPage === "404" && <NotFound onVoltar={() => setCurrentPage("home")} />}
      </main>

      {/* Footer */}
      <footer className="bg-[#1e4d7b] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap size={20} />
            <span className="font-bold text-lg">Glingo</span>
          </div>
          <p className="text-blue-200 text-sm">Escola de idiomas — Aprendizado para todos</p>
        </div>
      </footer>
    </div>
  );
}

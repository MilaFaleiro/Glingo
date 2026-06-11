import { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ClassesListing from "./components/ClassesListing";
import EnrollmentConfirmation from "./components/EnrollmentConfirmation";
import SupportChat from "./components/SupportChat";
import AdminDashboard from "./components/AdminDashboard";
import type { Aluno, Professor } from "../services/api";

type Page = "home" | "auth" | "register" | "classes" | "confirmation" | "support" | "admin";

const languages = [
  { flag: "🇺🇸", name: "Inglês", status: "Vagas abertas", statusType: "open" },
  { flag: "🇪🇸", name: "Espanhol", status: "Vagas abertas", statusType: "open" },
  { flag: "🇧🇷", name: "Português", status: "Últimas vagas", statusType: "last" },
  { flag: "🇨🇳", name: "Mandarim", status: "Vagas abertas", statusType: "open" },
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
      setCurrentPage("home");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("aluno");
    sessionStorage.removeItem("professor");
    setAluno(null);
    setProfessor(null);
    setCurrentPage("home");
  };

  if (professor && currentPage === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const nomeUsuario = aluno?.nome || professor?.nome;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e4d7b] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setCurrentPage("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#1e4d7b] font-bold text-lg">G</span>
            </div>
            <h1 className="text-2xl font-bold">Glingo</h1>
          </button>
          <nav className="flex items-center gap-6">
            <button onClick={() => setCurrentPage("home")} className="hover:text-blue-200 transition-colors text-sm font-medium">Início</button>
            <button onClick={() => setCurrentPage("classes")} className="hover:text-blue-200 transition-colors text-sm font-medium">Cursos</button>
            {aluno && (
              <>
                <button onClick={() => setCurrentPage("confirmation")} className="hover:text-blue-200 transition-colors text-sm font-medium">Minhas Matrículas</button>
                <button onClick={() => setCurrentPage("support")} className="hover:text-blue-200 transition-colors text-sm font-medium">Atendimento</button>
              </>
            )}
            {nomeUsuario ? (
              <div className="flex items-center gap-3">
                <span className="text-blue-200 text-sm">Olá, {nomeUsuario.split(" ")[0]}</span>
                <button onClick={handleLogout}
                  className="bg-white text-[#1e4d7b] px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                  Sair
                </button>
              </div>
            ) : (
              <button onClick={() => setCurrentPage("auth")}
                className="bg-white text-[#1e4d7b] px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                Entrar
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* HOME */}
        {currentPage === "home" && (
          <>
            <div className="bg-gradient-to-r from-[#2563eb] to-[#1e4d7b] text-white rounded-2xl p-12 mb-12 text-center shadow-lg">
              <h2 className="text-4xl font-bold mb-4">Aprenda um idioma novo</h2>
              <p className="text-xl opacity-90 mb-6">Inglês · Espanhol · Português · Mandarim</p>
              {!aluno && (
                <button onClick={() => setCurrentPage("auth")}
                  className="bg-white text-[#1e4d7b] px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow">
                  Começar agora
                </button>
              )}
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Nossos cursos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {languages.map((lang) => (
                  <div key={lang.name}
                    onClick={() => setCurrentPage("classes")}
                    className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-5xl mb-3">{lang.flag}</div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">{lang.name}</h4>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      lang.statusType === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {lang.statusType === "open" ? "✓" : "⚠"} {lang.status}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setCurrentPage("classes")}
                className="w-full bg-[#2563eb] text-white py-4 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors shadow">
                Ver todas as turmas →
              </button>
            </div>

            {aluno && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setCurrentPage("classes")}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800">Ver turmas</h4>
                  <p className="text-gray-500 text-sm">Encontre o curso ideal</p>
                </button>
                <button onClick={() => setCurrentPage("confirmation")}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">🎓</div>
                  <h4 className="font-semibold text-gray-800">Minhas matrículas</h4>
                  <p className="text-gray-500 text-sm">Gerencie seus cursos</p>
                </button>
                <button onClick={() => setCurrentPage("support")}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">💬</div>
                  <h4 className="font-semibold text-gray-800">Atendimento</h4>
                  <p className="text-gray-500 text-sm">Fale com a nossa equipe</p>
                </button>
              </div>
            )}
          </>
        )}

        {/* AUTH */}
        {currentPage === "auth" && (
          <div className="max-w-md mx-auto">
            <LoginForm onLoginSuccess={handleLoginSuccess} onCadastrar={() => setCurrentPage("register")} />
          </div>
        )}

        {/* REGISTER */}
        {currentPage === "register" && (
          <div className="max-w-md mx-auto">
            <RegisterForm onSucesso={() => setCurrentPage("auth")} />
            <p className="text-center text-gray-500 text-sm mt-4">
              Já tem conta?{" "}
              <button onClick={() => setCurrentPage("auth")} className="text-[#2563eb] font-semibold hover:underline">
                Fazer login
              </button>
            </p>
          </div>
        )}

        {currentPage === "classes" && (
          <>
            {!aluno && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <p className="text-blue-800 text-sm">Faça login para se matricular nas turmas.</p>
                <button onClick={() => setCurrentPage("auth")}
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e4d7b] transition-colors">
                  Entrar
                </button>
              </div>
            )}
            <ClassesListing />
          </>
        )}

        {currentPage === "confirmation" && <EnrollmentConfirmation />}
        {currentPage === "support" && <SupportChat />}
      </main>
    </div>
  );
}

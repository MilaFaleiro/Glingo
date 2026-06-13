import { useState } from "react";
import { GraduationCap, LogIn } from "lucide-react";
import { alunosApi, professoresApi, type Aluno, type Professor } from "../../services/api";

interface Props {
  onLoginSuccess?: (user: Aluno | Professor, tipo: "aluno" | "professor") => void;
  onCadastrar?: () => void;
}

function traduzirErro(msg: string): string {
  if (msg.includes("Failed to fetch") || msg.includes("fetch"))
    return "Não foi possível conectar ao servidor. Verifique se o sistema está rodando.";
  if (msg.includes("Email ou senha incorretos") || msg.includes("401"))
    return "Email ou senha incorretos. Tente novamente.";
  if (msg.includes("404")) return "Usuário não encontrado.";
  if (msg.includes("500")) return "Erro interno do servidor. Tente mais tarde.";
  return msg;
}

export default function LoginForm({ onLoginSuccess, onCadastrar }: Props) {
  const [tipo, setTipo] = useState<"aluno" | "professor">("aluno");
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      if (tipo === "aluno") {
        const res = await alunosApi.login(formData.email, formData.senha);
        sessionStorage.setItem("aluno", JSON.stringify(res.aluno));
        sessionStorage.removeItem("professor");
        onLoginSuccess?.(res.aluno, "aluno");
      } else {
        const res = await professoresApi.login(formData.email, formData.senha);
        sessionStorage.setItem("professor", JSON.stringify(res.professor));
        sessionStorage.removeItem("aluno");
        onLoginSuccess?.(res.professor, "professor");
      }
    } catch (err: unknown) {
      setErro(traduzirErro(err instanceof Error ? err.message : "Erro ao fazer login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-md">
          <GraduationCap className="text-white" size={30} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Glingo</h2>
        <p className="text-gray-500 text-sm mt-1">Faça login para continuar</p>
      </div>

      {/* Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button onClick={() => { setTipo("aluno"); setErro(null); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            tipo === "aluno" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}>
          Sou Aluno
        </button>
        <button onClick={() => { setTipo("professor"); setErro(null); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            tipo === "professor" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}>
          Sou Professor
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          ⚠️ {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="E-mail" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required />
        <input type="password" placeholder="Senha" value={formData.senha}
          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <LogIn size={18} />
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Não tem conta?{" "}
        <button onClick={onCadastrar} className="text-blue-600 font-semibold hover:underline">
          Cadastre-se
        </button>
      </p>
    </div>
  );
}

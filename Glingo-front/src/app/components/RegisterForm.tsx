import { useState } from "react";
import { alunosApi, professoresApi } from "../../services/api";

interface Props {
  onSucesso?: () => void;
}

export default function RegisterForm({ onSucesso }: Props) {
  const [tipo, setTipo] = useState<"aluno" | "professor">("aluno");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const [alunoData, setAlunoData] = useState({
    nome: "", cpf: "", email: "", telefone: "",
    data_nasc: "", senha: "", confirmSenha: "",
  });

  const [profData, setProfData] = useState({
    nome: "", email: "", ra: "", telefone: "",
    especialidade: "", senha: "", confirmSenha: "",
  });

  const handleSubmitAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoData.senha !== alunoData.confirmSenha) {
      setErro("As senhas não coincidem."); return;
    }
    setErro(null); setLoading(true);
    try {
      await alunosApi.cadastrar({
        nome: alunoData.nome, cpf: alunoData.cpf,
        email: alunoData.email, senha: alunoData.senha,
        telefone: alunoData.telefone,
        data_nasc: alunoData.data_nasc || undefined,
      });
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally { setLoading(false); }
  };

  const handleSubmitProf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profData.senha !== profData.confirmSenha) {
      setErro("As senhas não coincidem."); return;
    }
    setErro(null); setLoading(true);
    try {
      await professoresApi.cadastrar({
        nome: profData.nome, email: profData.email,
        senha: profData.senha, ra: profData.ra,
        telefone: profData.telefone,
        especialidade: profData.especialidade,
      });
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally { setLoading(false); }
  };

  if (sucesso) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md mx-auto text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Cadastro realizado!</h3>
        <p className="text-gray-600 mb-6">Sua conta foi criada com sucesso.</p>
        <button
          onClick={onSucesso}
          className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors"
        >
          Fazer login
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Criar conta</h2>

      {/* Toggle Aluno / Professor */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setTipo("aluno"); setErro(null); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            tipo === "aluno" ? "bg-white text-[#2563eb] shadow-sm" : "text-gray-500"
          }`}
        >
          Sou Aluno
        </button>
        <button
          onClick={() => { setTipo("professor"); setErro(null); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            tipo === "professor" ? "bg-white text-[#2563eb] shadow-sm" : "text-gray-500"
          }`}
        >
          Sou Professor
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {erro}
        </div>
      )}

      {/* Formulário Aluno */}
      {tipo === "aluno" && (
        <form onSubmit={handleSubmitAluno} className="space-y-4">
          <input type="text" placeholder="Nome completo" required className={inputClass}
            value={alunoData.nome} onChange={(e) => setAlunoData({ ...alunoData, nome: e.target.value })} />
          <input type="text" placeholder="CPF (000.000.000-00)" required className={inputClass}
            value={alunoData.cpf} onChange={(e) => setAlunoData({ ...alunoData, cpf: e.target.value })} />
          <input type="email" placeholder="E-mail" required className={inputClass}
            value={alunoData.email} onChange={(e) => setAlunoData({ ...alunoData, email: e.target.value })} />
          <input type="tel" placeholder="Telefone" required className={inputClass}
            value={alunoData.telefone} onChange={(e) => setAlunoData({ ...alunoData, telefone: e.target.value })} />
          <input type="date" placeholder="Data de nascimento" className={inputClass}
            value={alunoData.data_nasc} onChange={(e) => setAlunoData({ ...alunoData, data_nasc: e.target.value })} />
          <input type="password" placeholder="Senha" required className={inputClass}
            value={alunoData.senha} onChange={(e) => setAlunoData({ ...alunoData, senha: e.target.value })} />
          <input type="password" placeholder="Confirmar senha" required className={inputClass}
            value={alunoData.confirmSenha} onChange={(e) => setAlunoData({ ...alunoData, confirmSenha: e.target.value })} />
          <button type="submit" disabled={loading}
            className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors disabled:opacity-50">
            {loading ? "Criando conta..." : "Criar conta de aluno"}
          </button>
        </form>
      )}

      {/* Formulário Professor */}
      {tipo === "professor" && (
        <form onSubmit={handleSubmitProf} className="space-y-4">
          <input type="text" placeholder="Nome completo" required className={inputClass}
            value={profData.nome} onChange={(e) => setProfData({ ...profData, nome: e.target.value })} />
          <input type="email" placeholder="E-mail institucional" required className={inputClass}
            value={profData.email} onChange={(e) => setProfData({ ...profData, email: e.target.value })} />
          <input type="text" placeholder="RA (Registro Acadêmico)" required className={inputClass}
            value={profData.ra} onChange={(e) => setProfData({ ...profData, ra: e.target.value })} />
          <input type="tel" placeholder="Telefone" className={inputClass}
            value={profData.telefone} onChange={(e) => setProfData({ ...profData, telefone: e.target.value })} />
          <input type="text" placeholder="Especialidade (ex: Inglês, Espanhol)" className={inputClass}
            value={profData.especialidade} onChange={(e) => setProfData({ ...profData, especialidade: e.target.value })} />
          <input type="password" placeholder="Senha" required className={inputClass}
            value={profData.senha} onChange={(e) => setProfData({ ...profData, senha: e.target.value })} />
          <input type="password" placeholder="Confirmar senha" required className={inputClass}
            value={profData.confirmSenha} onChange={(e) => setProfData({ ...profData, confirmSenha: e.target.value })} />
          <button type="submit" disabled={loading}
            className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors disabled:opacity-50">
            {loading ? "Criando conta..." : "Criar conta de professor"}
          </button>
        </form>
      )}
    </div>
  );
}

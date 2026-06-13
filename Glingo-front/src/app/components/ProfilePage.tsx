import { useState } from "react";
import { alunosApi, type Aluno } from "../../services/api";

interface Props {
  aluno: Aluno;
  onAtualizar: (aluno: Aluno) => void;
}

export default function ProfilePage({ aluno, onAtualizar }: Props) {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: aluno.nome,
    telefone: aluno.telefone ?? "",
    senha: "",
    confirmSenha: "",
  });

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha && form.senha !== form.confirmSenha) {
      setErro("As senhas não coincidem."); return;
    }
    setErro(null); setLoading(true);
    try {
      await alunosApi.atualizar(aluno.id, {
        nome: form.nome,
        telefone: form.telefone,
        senha: form.senha || undefined,
      });
      const novoAluno = { ...aluno, nome: form.nome, telefone: form.telefone };
      sessionStorage.setItem("aluno", JSON.stringify(novoAluno));
      onAtualizar(novoAluno);
      setSucesso(true);
      setEditando(false);
      setForm({ ...form, senha: "", confirmSenha: "" });
      setTimeout(() => setSucesso(false), 3000);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500";
  const readonlyClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-[#2563eb] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {aluno.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{aluno.nome}</h2>
            <p className="text-gray-500">{aluno.email}</p>
          </div>
        </div>

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
            ✅ Dados atualizados com sucesso!
          </div>
        )}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {erro}
          </div>
        )}

        {!editando ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Nome completo</label>
                <div className={readonlyClass}>{aluno.nome}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">E-mail</label>
                <div className={readonlyClass}>{aluno.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">CPF</label>
                <div className={readonlyClass}>{aluno.cpf ?? "—"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Telefone</label>
                <div className={readonlyClass}>{aluno.telefone ?? "—"}</div>
              </div>
              {aluno.data_nasc && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Data de nascimento</label>
                  <div className={readonlyClass}>{new Date(aluno.data_nasc).toLocaleDateString("pt-BR")}</div>
                </div>
              )}
            </div>
            <button onClick={() => setEditando(true)}
              className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors">
              Editar dados
            </button>
          </>
        ) : (
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nome completo</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">E-mail (não editável)</label>
              <div className={readonlyClass}>{aluno.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Telefone</label>
              <input type="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nova senha (deixe em branco para manter)</label>
              <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Nova senha" className={inputClass} />
            </div>
            {form.senha && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Confirmar nova senha</label>
                <input type="password" value={form.confirmSenha} onChange={(e) => setForm({ ...form, confirmSenha: e.target.value })}
                  placeholder="Confirmar senha" className={inputClass} />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditando(false); setErro(null); }}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Check, BookOpen, X } from "lucide-react";
import { matriculasApi, type Matricula } from "../../services/api";

function traduzirErro(msg: string): string {
  if (msg.includes("fetch") || msg.includes("Failed"))
    return "Não foi possível conectar ao servidor. Verifique se o sistema está rodando.";
  if (msg.includes("404")) return "Matrícula não encontrada.";
  if (msg.includes("500")) return "Erro interno do servidor. Tente mais tarde.";
  return msg;
}

export default function EnrollmentConfirmation() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);

  const alunoRaw = sessionStorage.getItem("aluno");
  const aluno = alunoRaw ? JSON.parse(alunoRaw) : null;

  const carregar = async () => {
    if (!aluno) { setLoading(false); return; }
    try {
      const dados = await matriculasApi.listarDoAluno(aluno.id);
      setMatriculas(dados);
    } catch (e: unknown) {
      setErro(traduzirErro(e instanceof Error ? e.message : "Erro"));
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja cancelar esta matrícula?")) return;
    setCancelando(id);
    try {
      await matriculasApi.cancelar(id);
      await carregar();
    } catch (e: unknown) {
      alert(traduzirErro(e instanceof Error ? e.message : "Erro ao cancelar"));
    } finally { setCancelando(null); }
  };

  if (!aluno) return (
    <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
      <p className="text-yellow-800">Faça login para ver suas matrículas.</p>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400">Carregando matrículas...</p>
    </div>
  );

  if (erro) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-4xl mx-auto">
      ⚠️ {erro}
    </div>
  );

  const ativa = matriculas.find(m => m.status === "ativa");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Matrícula ativa */}
      {ativa && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Matrícula ativa</h3>
              <p className="text-green-600 text-sm">Tudo certo!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Idioma", value: ativa.idioma },
              { label: "Nível", value: ativa.nivel },
              { label: "Professor", value: ativa.professor },
              { label: "Horário", value: ativa.horario },
              { label: "Modalidade", value: ativa.modalidade },
              { label: "Data", value: new Date(ativa.data_matricula).toLocaleDateString("pt-BR") },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="font-medium text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Todas as matrículas</h3>
        {matriculas.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">Nenhuma matrícula encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matriculas.map(m => (
              <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{m.idioma} — {m.nivel}</p>
                    <p className="text-xs text-gray-500">{m.professor} · {new Date(m.data_matricula).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    m.status === "ativa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>{m.status}</span>
                  {m.status === "ativa" && (
                    <button onClick={() => handleCancelar(m.id)} disabled={cancelando === m.id}
                      className="text-red-400 hover:text-red-600 disabled:opacity-50">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

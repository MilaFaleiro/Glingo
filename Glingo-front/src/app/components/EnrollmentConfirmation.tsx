import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { matriculasApi, type Matricula } from "../../services/api";

export default function EnrollmentConfirmation() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [ultima, setUltima] = useState<Matricula | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);

  const alunoRaw = sessionStorage.getItem("aluno");
  const aluno = alunoRaw ? JSON.parse(alunoRaw) : null;

  const carregar = async () => {
    if (!aluno) {
      setLoading(false);
      return;
    }
    try {
      const dados = await matriculasApi.listarDoAluno(aluno.id);
      setMatriculas(dados);
      const ativas = dados.filter((m) => m.status === "ativa");
      if (ativas.length > 0) setUltima(ativas[0]);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja cancelar esta matrícula?")) return;
    setCancelando(id);
    try {
      await matriculasApi.cancelar(id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao cancelar");
    } finally {
      setCancelando(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ativa": return "text-green-600";
      case "cancelada": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (!aluno)
    return (
      <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">Faça login para ver suas matrículas.</p>
      </div>
    );

  if (loading)
    return <div className="text-center py-12 text-gray-500">Carregando matrículas...</div>;

  if (erro)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 max-w-4xl mx-auto">
        Erro: {erro}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Última matrícula ativa */}
      {ultima && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 text-white rounded-full p-1">
                <Check size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-800 mb-1">Matrícula ativa!</h2>
                <p className="text-green-700">
                  Olá, <strong>{aluno.nome}</strong>. Sua matrícula está confirmada.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Matrícula atual</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600">Idioma:</span>
                <span className="font-semibold">{ultima.idioma} — {ultima.nivel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Professor:</span>
                <span className="font-semibold">{ultima.professor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-semibold">{ultima.horario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modalidade:</span>
                <span className="font-semibold">{ultima.modalidade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize ${statusColor(ultima.status)}`}>
                  {ultima.status}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Histórico */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Minhas matrículas</h3>
        {matriculas.length === 0 ? (
          <p className="text-gray-500">Nenhuma matrícula encontrada.</p>
        ) : (
          <div className="space-y-3">
            {matriculas.map((m) => (
              <div
                key={m.id}
                className="border-b border-gray-200 pb-3 last:border-0 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {m.idioma} — {m.nivel}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(m.data_matricula).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold capitalize ${statusColor(m.status)}`}>
                    {m.status}
                  </span>
                  {m.status === "ativa" && (
                    <button
                      disabled={cancelando === m.id}
                      onClick={() => handleCancelar(m.id)}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancelando === m.id ? "..." : "Cancelar"}
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

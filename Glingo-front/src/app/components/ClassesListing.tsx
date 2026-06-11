import { useState, useEffect } from "react";
import { turmasApi, matriculasApi, type Turma, type Idioma } from "../../services/api";

// Flags por nome de idioma (extensível)
const IDIOMA_FLAG: Record<string, string> = {
  inglês: "🇺🇸",
  espanhol: "🇪🇸",
  português: "🇧🇷",
  mandarim: "🇨🇳",
  francês: "🇫🇷",
  alemão: "🇩🇪",
  japonês: "🇯🇵",
};

function getFlag(nome: string): string {
  return IDIOMA_FLAG[nome.toLowerCase()] ?? "🌐";
}

export default function ClassesListing() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [selectedIdioma, setSelectedIdioma] = useState("all");
  const [selectedNivel, setSelectedNivel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [matriculando, setMatriculando] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    Promise.all([turmasApi.listar(), turmasApi.listarIdiomas()])
      .then(([t, i]) => {
        setTurmas(t);
        setIdiomas(i);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = turmas.filter((t) => {
    const okIdioma = selectedIdioma === "all" || t.idioma === selectedIdioma;
    const okNivel = selectedNivel === "all" || t.nivel === selectedNivel;
    return okIdioma && okNivel;
  });

  const handleMatricular = async (turma_id: number) => {
    const raw = sessionStorage.getItem("aluno");
    if (!raw) {
      setFeedback({ id: turma_id, msg: "Faça login primeiro para se matricular.", ok: false });
      return;
    }
    const aluno = JSON.parse(raw);
    setMatriculando(turma_id);
    setFeedback(null);
    try {
      await matriculasApi.realizar(aluno.id, turma_id);
      // Atualiza vagas localmente
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === turma_id ? { ...t, vagas_restantes: t.vagas_restantes - 1 } : t
        )
      );
      setFeedback({ id: turma_id, msg: "Matrícula realizada com sucesso!", ok: true });
    } catch (e: unknown) {
      setFeedback({ id: turma_id, msg: e instanceof Error ? e.message : "Erro", ok: false });
    } finally {
      setMatriculando(null);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-gray-500">Carregando turmas...</div>;

  if (erro)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 max-w-4xl mx-auto">
        Erro ao carregar turmas: {erro}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Turmas disponíveis</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedIdioma}
          onChange={(e) => setSelectedIdioma(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos idiomas</option>
          {idiomas.map((i) => (
            <option key={i.id} value={i.nome}>
              {i.nome}
            </option>
          ))}
        </select>
        <select
          value={selectedNivel}
          onChange={(e) => setSelectedNivel(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos níveis</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nenhuma turma encontrada.</p>
        )}
        {filtered.map((t) => (
          <div key={t.id}>
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getFlag(t.idioma)}</span>
                  <h3 className="font-semibold text-lg">
                    {t.idioma} — {t.nivel}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">{t.professor} · {t.modalidade}</p>
                <p className="text-gray-600 text-sm">{t.horario}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-2xl font-bold text-gray-800">{t.vagas_restantes}</span>
                <span className="text-xs text-gray-500">vagas</span>
                {t.vagas_restantes > 0 ? (
                  <button
                    disabled={matriculando === t.id}
                    onClick={() => handleMatricular(t.id)}
                    className="bg-[#2563eb] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1e4d7b] transition-colors disabled:opacity-50"
                  >
                    {matriculando === t.id ? "..." : "Matricular"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Esgotado
                  </button>
                )}
              </div>
            </div>
            {feedback?.id === t.id && (
              <p
                className={`text-sm mt-1 px-1 ${
                  feedback.ok ? "text-green-600" : "text-red-600"
                }`}
              >
                {feedback.msg}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

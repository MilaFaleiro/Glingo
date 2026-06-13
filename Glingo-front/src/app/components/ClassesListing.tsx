import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { turmasApi, matriculasApi, type Turma, type Idioma } from "../../services/api";

const IDIOMA_SIGLA: Record<string, string> = {
  "inglês": "US", "espanhol": "ES", "português": "BR",
  "mandarim": "CN", "francês": "FR", "alemão": "DE", "japonês": "JP",
};
const IDIOMA_COLOR: Record<string, { bg: string; text: string; bar: string }> = {
  "inglês":    { bg: "bg-blue-100",   text: "text-blue-600",   bar: "bg-blue-500" },
  "espanhol":  { bg: "bg-green-100",  text: "text-green-600",  bar: "bg-green-500" },
  "português": { bg: "bg-yellow-100", text: "text-yellow-600", bar: "bg-yellow-500" },
  "mandarim":  { bg: "bg-red-100",    text: "text-red-600",    bar: "bg-red-500" },
  "francês":   { bg: "bg-purple-100", text: "text-purple-600", bar: "bg-purple-500" },
  "alemão":    { bg: "bg-orange-100", text: "text-orange-600", bar: "bg-orange-500" },
  "japonês":   { bg: "bg-pink-100",   text: "text-pink-600",   bar: "bg-pink-500" },
};
const DEFAULT_COLOR = { bg: "bg-gray-100", text: "text-gray-600", bar: "bg-gray-500" };

function getColor(nome: string) { return IDIOMA_COLOR[nome.toLowerCase()] ?? DEFAULT_COLOR; }
function getSigla(nome: string) { return IDIOMA_SIGLA[nome.toLowerCase()] ?? nome.slice(0,2).toUpperCase(); }

interface CourseCardProps {
  turma: Turma;
  onMatricular: (id: number) => void;
  matriculando: boolean;
  isProfessor: boolean;
  feedback?: { msg: string; ok: boolean } | null;
}

function CourseCard({ turma, onMatricular, matriculando, isProfessor, feedback }: CourseCardProps) {
  const color = getColor(turma.idioma);
  const pct = Math.round(((turma.vagas_total - turma.vagas_restantes) / turma.vagas_total) * 100);
  const isLast = turma.vagas_restantes > 0 && turma.vagas_restantes <= 3;
  const isFull = turma.vagas_restantes === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color.bg} rounded-xl flex items-center justify-center`}>
          <span className={`font-bold text-sm ${color.text}`}>{getSigla(turma.idioma)}</span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          isFull ? "bg-red-100 text-red-700" :
          isLast ? "bg-orange-100 text-orange-700" :
          "bg-green-100 text-green-700"
        }`}>
          {isFull ? "Esgotado" : isLast ? "Últimas vagas" : "Vagas abertas"}
        </span>
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-1">{turma.idioma}</h3>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Nível:</span>
          <span className="text-gray-700 font-medium">{turma.nivel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Professor:</span>
          <span className="text-gray-700 font-medium">{turma.professor}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Modalidade:</span>
          <span className="text-gray-700 font-medium">{turma.modalidade}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Horário:</span>
          <span className="text-gray-700 font-medium">{turma.horario}</span>
        </div>
      </div>

      {/* Barra de vagas */}
      <div className="mb-4">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`${color.bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{turma.vagas_restantes} de {turma.vagas_total} vagas disponíveis</p>
      </div>

      {feedback && (
        <p className={`text-xs mb-3 ${feedback.ok ? "text-green-600" : "text-red-600"}`}>{feedback.msg}</p>
      )}

      {isProfessor ? (
        <div className={`w-full text-center py-2.5 rounded-xl text-sm font-medium ${color.bg} ${color.text}`}>
          {turma.vagas_restantes}/{turma.vagas_total} vagas
        </div>
      ) : (
        <button
          onClick={() => onMatricular(turma.id)}
          disabled={isFull || matriculando}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isFull ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
            `${color.bg} ${color.text} hover:opacity-80`
          }`}>
          {matriculando ? "Processando..." : isFull ? "Esgotado" : <>Matricular <ChevronRight size={16} /></>}
        </button>
      )}
    </div>
  );
}

export default function ClassesListing() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [selectedIdioma, setSelectedIdioma] = useState("all");
  const [selectedNivel, setSelectedNivel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [matriculando, setMatriculando] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, { msg: string; ok: boolean }>>({});

  const alunoRaw = sessionStorage.getItem("aluno");
  const aluno = alunoRaw ? JSON.parse(alunoRaw) : null;
  const isProfessor = !!sessionStorage.getItem("professor");

  useEffect(() => {
    Promise.all([turmasApi.listar(), turmasApi.listarIdiomas()])
      .then(([t, i]) => { setTurmas(t); setIdiomas(i); })
      .catch(() => setErro("Não foi possível carregar as turmas. Verifique se o servidor está rodando."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = turmas.filter(t => {
    const okIdioma = selectedIdioma === "all" || t.idioma === selectedIdioma;
    const okNivel = selectedNivel === "all" || t.nivel === selectedNivel;
    return okIdioma && okNivel;
  });

  const handleMatricular = async (turma_id: number) => {
    if (!aluno) {
      setFeedbacks(prev => ({ ...prev, [turma_id]: { msg: "Faça login para se matricular.", ok: false } }));
      return;
    }
    setMatriculando(turma_id);
    try {
      await matriculasApi.realizar(aluno.id, turma_id);
      setTurmas(prev => prev.map(t => t.id === turma_id ? { ...t, vagas_restantes: t.vagas_restantes - 1 } : t));
      setFeedbacks(prev => ({ ...prev, [turma_id]: { msg: "✅ Matrícula realizada!", ok: true } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      setFeedbacks(prev => ({ ...prev, [turma_id]: { msg: msg.includes("fetch") ? "Erro de conexão. Tente novamente." : msg, ok: false } }));
    } finally { setMatriculando(null); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400">Carregando turmas...</p>
    </div>
  );

  if (erro) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-4xl mx-auto">⚠️ {erro}</div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Turmas disponíveis</h2>
        <span className="text-gray-400 text-sm">{filtered.length} turma{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex gap-3 mb-8">
        <select value={selectedIdioma} onChange={e => setSelectedIdioma(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">Todos idiomas</option>
          {idiomas.map(i => <option key={i.id} value={i.nome}>{i.nome}</option>)}
        </select>
        <select value={selectedNivel} onChange={e => setSelectedNivel(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">Todos níveis</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Nenhuma turma encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <CourseCard
              key={t.id}
              turma={t}
              onMatricular={handleMatricular}
              matriculando={matriculando === t.id}
              isProfessor={isProfessor}
              feedback={feedbacks[t.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

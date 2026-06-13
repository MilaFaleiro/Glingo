import { useState, useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import { turmasApi, matriculasApi, type Turma, type Idioma } from "../../services/api";

interface Props {
  onConcluido: () => void;
}

type Etapa = 0 | 1 | 2 | 3 | 4;

const ETAPAS = ["Dados", "Idioma", "Turma", "Confirmação", "Concluído"];

const IDIOMA_FLAG: Record<string, string> = {
  "inglês": "🇺🇸", "espanhol": "🇪🇸", "português": "🇧🇷",
  "mandarim": "🇨🇳", "francês": "🇫🇷", "alemão": "🇩🇪", "japonês": "🇯🇵",
};

export default function EnrollmentWizard({ onConcluido }: Props) {
  const [etapa, setEtapa] = useState<Etapa>(0);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [idiomaEscolhido, setIdiomaEscolhido] = useState<Idioma | null>(null);
  const [turmaEscolhida, setTurmaEscolhida] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alunoRaw = sessionStorage.getItem("aluno");
  const aluno = alunoRaw ? JSON.parse(alunoRaw) : null;

  useEffect(() => {
    turmasApi.listarIdiomas().then(setIdiomas);
  }, []);

  const handleEscolherIdioma = async (idioma: Idioma) => {
    setIdiomaEscolhido(idioma);
    setLoading(true);
    try {
      const todas = await turmasApi.listar({ idioma_id: idioma.id });
      setTurmas(todas.filter(t => t.vagas_restantes > 0));
    } catch { setErro("Erro ao carregar turmas."); }
    finally { setLoading(false); }
    setEtapa(2);
  };

  const handleMatricular = async () => {
    if (!aluno || !turmaEscolhida) return;
    setLoading(true);
    setErro(null);
    try {
      await matriculasApi.realizar(aluno.id, turmaEscolhida.id);
      setEtapa(4);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao realizar matrícula");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-10">
        {ETAPAS.map((nome, i) => (
          <div key={nome} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                i < etapa ? "bg-blue-600 text-white" :
                i === etapa ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                "bg-gray-100 text-gray-400"
              }`}>
                {i < etapa ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i <= etapa ? "text-blue-600" : "text-gray-400"}`}>
                {nome}
              </span>
            </div>
            {i < ETAPAS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${i < etapa ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">⚠️ {erro}</div>
        )}

        {/* ETAPA 0 — Dados */}
        {etapa === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Seus dados</h2>
            <p className="text-gray-500 mb-6">Confirme seus dados antes de continuar.</p>
            {aluno ? (
              <div className="space-y-3 mb-8">
                {[
                  { label: "Nome", value: aluno.nome },
                  { label: "E-mail", value: aluno.email },
                  { label: "Telefone", value: aluno.telefone ?? "—" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className="font-medium text-gray-800 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500 mb-6">Você precisa estar logado para se matricular.</p>
            )}
            <button onClick={() => setEtapa(1)} disabled={!aluno}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ETAPA 1 — Idioma */}
        {etapa === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Escolha o idioma</h2>
            <p className="text-gray-500 mb-6">Qual idioma você quer aprender?</p>
            <div className="grid grid-cols-2 gap-3">
              {idiomas.map(idioma => (
                <button key={idioma.id} onClick={() => handleEscolherIdioma(idioma)}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                  <span className="text-3xl">{IDIOMA_FLAG[idioma.nome.toLowerCase()] ?? "🌐"}</span>
                  <span className="font-semibold text-gray-800">{idioma.nome}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setEtapa(0)} className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700">
              ← Voltar
            </button>
          </div>
        )}

        {/* ETAPA 2 — Turma */}
        {etapa === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Escolha a turma</h2>
            <p className="text-gray-500 mb-6">Turmas disponíveis de {idiomaEscolhido?.nome}</p>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Carregando turmas...</div>
            ) : turmas.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhuma turma disponível para este idioma.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {turmas.map(turma => (
                  <button key={turma.id}
                    onClick={() => { setTurmaEscolhida(turma); setEtapa(3); }}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${
                      turmaEscolhida?.id === turma.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{turma.nivel}</p>
                        <p className="text-sm text-gray-500">👨‍🏫 {turma.professor}</p>
                        <p className="text-sm text-gray-500">🕐 {turma.horario} · {turma.modalidade}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        turma.vagas_restantes <= 3 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                      }`}>
                        {turma.vagas_restantes} vagas
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setEtapa(1)} className="w-full text-gray-500 text-sm hover:text-gray-700">
              ← Voltar
            </button>
          </div>
        )}

        {/* ETAPA 3 — Confirmação */}
        {etapa === 3 && turmaEscolhida && idiomaEscolhido && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirme sua matrícula</h2>
            <p className="text-gray-500 mb-6">Revise os dados antes de finalizar.</p>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
              {[
                { label: "Idioma", value: `${IDIOMA_FLAG[idiomaEscolhido.nome.toLowerCase()] ?? "🌐"} ${idiomaEscolhido.nome}` },
                { label: "Nível", value: turmaEscolhida.nivel },
                { label: "Professor", value: turmaEscolhida.professor },
                { label: "Horário", value: turmaEscolhida.horario },
                { label: "Modalidade", value: turmaEscolhida.modalidade },
                { label: "Vagas restantes", value: String(turmaEscolhida.vagas_restantes) },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className="font-semibold text-gray-800 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleMatricular} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mb-3">
              {loading ? "Processando..." : "Confirmar matrícula"}
            </button>
            <button onClick={() => setEtapa(2)} className="w-full text-gray-500 text-sm hover:text-gray-700">
              ← Voltar
            </button>
          </div>
        )}

        {/* ETAPA 4 — Concluído */}
        {etapa === 4 && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Matrícula realizada!</h2>
            <p className="text-gray-500 mb-2">
              Você foi matriculado em <strong>{idiomaEscolhido?.nome} — {turmaEscolhida?.nivel}</strong>.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Horário: {turmaEscolhida?.horario} · Professor: {turmaEscolhida?.professor}
            </p>
            <button onClick={onConcluido}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Ir para meu painel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Users, GraduationCap, MessageSquare, Send, LogOut, Home, CheckCircle } from "lucide-react";
import { alunosApi, turmasApi, atendimentosApi } from "../../services/api";
import type { Aluno, Turma, Atendimento, Mensagem, Idioma } from "../../services/api";

type Secao = "dashboard" | "alunos" | "turmas" | "atendimentos";

interface Props { onLogout?: () => void; }

export default function AdminDashboard({ onLogout }: Props) {
  const [secao, setSecao] = useState<Secao>("dashboard");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [atSelecionado, setAtSelecionado] = useState<Atendimento | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluindo, setConcluindo] = useState(false);
  const [showNovaTurma, setShowNovaTurma] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novaTurma, setNovaTurma] = useState({ idioma_id: "", nivel: "Iniciante", professor: "", horario: "", modalidade: "Presencial", vagas_total: "20" });
  const msgEndRef = useRef<HTMLDivElement>(null);

  const profRaw = sessionStorage.getItem("professor");
  const professor = profRaw ? JSON.parse(profRaw) : null;

  const carregar = async (s: Secao) => {
    setLoading(true);
    try {
      if (s === "dashboard" || s === "alunos") setAlunos(await alunosApi.listar());
      if (s === "dashboard" || s === "turmas") {
        const [t, i] = await Promise.all([turmasApi.listar(), turmasApi.listarIdiomas()]);
        setTurmas(t); setIdiomas(i);
      }
      if (s === "dashboard" || s === "atendimentos") {
        const als = await alunosApi.listar();
        const todos: Atendimento[] = [];
        for (const al of als) {
          const ats = await atendimentosApi.listarDoAluno(al.id);
          todos.push(...ats);
        }
        setAtendimentos(todos);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const carregarMensagens = async (id: number) => {
    const msgs = await atendimentosApi.listarMensagens(id);
    setMensagens(msgs);
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { carregar(secao); }, [secao]);
  useEffect(() => { if (atSelecionado) carregarMensagens(atSelecionado.id); }, [atSelecionado]);

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resposta.trim() || !atSelecionado) return;
    setEnviando(true);
    try {
      await atendimentosApi.enviarMensagem(atSelecionado.id, "admin", resposta.trim());
      setResposta("");
      await carregarMensagens(atSelecionado.id);
    } catch { alert("Erro ao enviar"); }
    finally { setEnviando(false); }
  };

  const handleConcluir = async (id: number) => {
    if (!confirm("Deseja concluir este atendimento?")) return;
    setConcluindo(true);
    try {
      await fetch(`http://127.0.0.1:5000/atendimentos/${id}/concluir`, { method: "PATCH" });
      await carregar("atendimentos");
      setAtSelecionado(null);
      setMensagens([]);
    } catch { alert("Erro ao concluir atendimento"); }
    finally { setConcluindo(false); }
  };

  const handleCriarTurma = async () => {
    setSalvando(true);
    try {
      await turmasApi.cadastrar({
        idioma_id: Number(novaTurma.idioma_id), nivel: novaTurma.nivel,
        professor: novaTurma.professor, horario: novaTurma.horario,
        modalidade: novaTurma.modalidade, vagas_total: Number(novaTurma.vagas_total),
      });
      setShowNovaTurma(false);
      setNovaTurma({ idioma_id: "", nivel: "Iniciante", professor: "", horario: "", modalidade: "Presencial", vagas_total: "20" });
      setSecao("turmas");
      await carregar("turmas");
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
    finally { setSalvando(false); }
  };

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const abertos = atendimentos.filter(a => a.status === "aberto").length;
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500";

  const navItem = (s: Secao, icon: React.ReactNode, label: string, badge?: number) => (
    <button onClick={() => setSecao(s)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
        secao === s ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
      }`}>
      {icon}
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-[#1e4d7b] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#1e4d7b] font-bold">G</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Glingo — Painel do Professor</h1>
              {professor && <p className="text-blue-200 text-xs">{professor.nome} · {professor.especialidade || "Professor"}</p>}
            </div>
          </div>
          {/* Nav links no topo */}
          <nav className="flex items-center gap-2">
            {(["dashboard", "alunos", "turmas", "atendimentos"] as Secao[]).map((s) => {
              const labels: Record<Secao, string> = { dashboard: "Dashboard", alunos: "Alunos", turmas: "Turmas", atendimentos: "Atendimentos" };
              return (
                <button key={s} onClick={() => setSecao(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    secao === s ? "bg-white text-[#1e4d7b]" : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}>
                  {labels[s]}
                  {s === "atendimentos" && abertos > 0 && (
                    <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">{abertos}</span>
                  )}
                </button>
              );
            })}
            <button onClick={() => { sessionStorage.removeItem("professor"); onLogout?.(); }}
              className="flex items-center gap-1 text-blue-200 hover:text-white ml-4 text-sm">
              <LogOut size={16} /> Sair
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <button onClick={() => setSecao("dashboard")} className="flex items-center gap-1 hover:text-blue-600">
            <Home size={14} /> Dashboard
          </button>
          {secao !== "dashboard" && (
            <>
              <span>/</span>
              <span className="text-gray-800 font-medium capitalize">{secao}</span>
            </>
          )}
        </div>

        {loading && <div className="text-center py-12 text-gray-400">Carregando...</div>}

        {/* DASHBOARD */}
        {!loading && secao === "dashboard" && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-4xl font-bold text-[#2563eb] mb-1">{alunos.length}</div>
                <div className="text-gray-500 text-sm">Alunos</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-4xl font-bold text-[#2563eb] mb-1">{turmas.length}</div>
                <div className="text-gray-500 text-sm">Turmas</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className={`text-4xl font-bold mb-1 ${abertos > 0 ? "text-orange-500" : "text-green-500"}`}>{abertos}</div>
                <div className="text-gray-500 text-sm">Chamados abertos</div>
              </div>
            </div>

            {abertos > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <p className="text-orange-800 font-medium">⚠️ {abertos} atendimento{abertos > 1 ? "s" : ""} aguardando resposta.</p>
                <button onClick={() => setSecao("atendimentos")} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                  Ver atendimentos
                </button>
              </div>
            )}

            {/* Atalhos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button onClick={() => setSecao("alunos")}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-800">Alunos</h4>
                <p className="text-gray-500 text-sm">Ver todos os alunos</p>
              </button>
              <button onClick={() => setSecao("turmas")}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold text-gray-800">Turmas</h4>
                <p className="text-gray-500 text-sm">Gerenciar turmas</p>
              </button>
              <button onClick={() => setSecao("atendimentos")}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-semibold text-gray-800">Atendimentos</h4>
                <p className="text-gray-500 text-sm">{abertos > 0 ? `${abertos} aguardando` : "Nenhum pendente"}</p>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Alunos recentes</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Nome</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3">{a.nome}</td>
                      <td className="py-3 px-3 text-gray-500 text-sm">{a.email}</td>
                      <td className="py-3 px-3 text-gray-500 text-sm">{a.telefone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ALUNOS */}
        {!loading && secao === "alunos" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Alunos ({alunos.length})</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Nome</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Telefone</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{a.nome}</td>
                    <td className="py-3 px-3 text-gray-500 text-sm">{a.email}</td>
                    <td className="py-3 px-3 text-gray-500 text-sm">{a.telefone ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TURMAS */}
        {!loading && secao === "turmas" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Turmas ({turmas.length})</h2>
              <button onClick={() => setShowNovaTurma(true)}
                className="bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e4d7b] transition-colors">
                + Nova turma
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Idioma</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Nível</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Professor</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Horário</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Modalidade</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Vagas</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{t.idioma}</td>
                    <td className="py-3 px-3">{t.nivel}</td>
                    <td className="py-3 px-3 text-gray-500 text-sm">{t.professor}</td>
                    <td className="py-3 px-3 text-gray-500 text-sm">{t.horario}</td>
                    <td className="py-3 px-3 text-gray-500 text-sm">{t.modalidade}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${t.vagas_restantes === 0 ? "text-red-500" : "text-green-600"}`}>
                        {t.vagas_restantes}/{t.vagas_total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ATENDIMENTOS */}
        {!loading && secao === "atendimentos" && (
          <div className="flex gap-4">
            <div className="w-72 bg-white rounded-2xl shadow-sm p-4 h-fit">
              <h3 className="font-bold text-gray-800 mb-3">Atendimentos</h3>
              <div className="space-y-2">
                {atendimentos.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum atendimento.</p>}
                {atendimentos.map((at) => (
                  <button key={at.id} onClick={() => setAtSelecionado(at)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      atSelecionado?.id === at.id ? "border-blue-300 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">#{String(at.id).padStart(3, "0")} {at.tipo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        at.status === "aberto" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>{at.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(at.created_at).toLocaleDateString("pt-BR")}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
              {atSelecionado ? (
                <>
                  <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">#{String(atSelecionado.id).padStart(3, "0")} — {atSelecionado.tipo}</h3>
                      {atSelecionado.descricao && <p className="text-sm text-gray-500 mt-1">{atSelecionado.descricao}</p>}
                    </div>
                    {atSelecionado.status === "aberto" && (
                      <button onClick={() => handleConcluir(atSelecionado.id)} disabled={concluindo}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50">
                        <CheckCircle size={16} />
                        {concluindo ? "..." : "Concluir"}
                      </button>
                    )}
                  </div>

                  <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {mensagens.map((msg) => {
                      const isAdmin = msg.remetente === "admin";
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-sm rounded-2xl px-4 py-3 ${
                            isAdmin ? "bg-[#2563eb] text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                          }`}>
                            <p className="text-sm">{msg.conteudo}</p>
                            <p className={`text-xs mt-1 ${isAdmin ? "text-blue-100" : "text-gray-400"}`}>
                              {formatHora(msg.data_envio)} · {isAdmin ? "Você" : "Aluno"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>

                  {atSelecionado.status === "aberto" && (
                    <div className="p-4 border-t border-gray-100">
                      <form onSubmit={handleResponder} className="flex gap-2">
                        <input type="text" value={resposta} onChange={(e) => setResposta(e.target.value)}
                          placeholder="Responder ao aluno..."
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        <button type="submit" disabled={enviando || !resposta.trim()}
                          className="bg-[#2563eb] text-white px-4 py-2.5 rounded-xl hover:bg-[#1e4d7b] transition-colors disabled:opacity-50 flex items-center gap-2">
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  )}

                  {atSelecionado.status !== "aberto" && (
                    <div className="p-4 border-t border-gray-100 bg-green-50 text-center text-green-700 text-sm font-medium">
                      ✅ Atendimento concluído
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 p-8">
                  Selecione um atendimento para ver as mensagens
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Turma */}
      {showNovaTurma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nova turma</h3>
            <div className="space-y-3">
              <select value={novaTurma.idioma_id} onChange={(e) => setNovaTurma({ ...novaTurma, idioma_id: e.target.value })} className={inputClass}>
                <option value="">Selecione o idioma...</option>
                {idiomas.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
              <select value={novaTurma.nivel} onChange={(e) => setNovaTurma({ ...novaTurma, nivel: e.target.value })} className={inputClass}>
                <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
              </select>
              <input type="text" placeholder="Nome do professor" value={novaTurma.professor}
                onChange={(e) => setNovaTurma({ ...novaTurma, professor: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Horário (ex: Seg/Qua 18h-19h30)" value={novaTurma.horario}
                onChange={(e) => setNovaTurma({ ...novaTurma, horario: e.target.value })} className={inputClass} />
              <select value={novaTurma.modalidade} onChange={(e) => setNovaTurma({ ...novaTurma, modalidade: e.target.value })} className={inputClass}>
                <option>Presencial</option><option>Online</option><option>Híbrido</option>
              </select>
              <input type="number" placeholder="Vagas totais" value={novaTurma.vagas_total}
                onChange={(e) => setNovaTurma({ ...novaTurma, vagas_total: e.target.value })} className={inputClass} min={1} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNovaTurma(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button disabled={salvando || !novaTurma.idioma_id || !novaTurma.professor || !novaTurma.horario}
                onClick={handleCriarTurma}
                className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors disabled:opacity-50">
                {salvando ? "Salvando..." : "Criar turma"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

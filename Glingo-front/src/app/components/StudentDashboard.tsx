import { useState, useEffect } from "react";
import { Edit2, BookOpen, Clock, User, CheckCircle, Calendar, MessageSquare, Bell } from "lucide-react";
import { matriculasApi, atendimentosApi, type Aluno, type Matricula, type Atendimento } from "../../services/api";

interface Props {
  aluno: Aluno;
  onEditar: () => void;
  onNovaMatricula: () => void;
  onAtendimento: () => void;
}

type Aba = "visao" | "historico" | "atendimentos";

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const COLORS = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
function getColor(nome: string) {
  return COLORS[nome.charCodeAt(0) % COLORS.length];
}

export default function StudentDashboard({ aluno, onEditar, onNovaMatricula, onAtendimento }: Props) {
  const [aba, setAba] = useState<Aba>("visao");
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  const matriculaAtiva = matriculas.find(m => m.status === "ativa");

  useEffect(() => {
    Promise.all([
      matriculasApi.listarDoAluno(aluno.id),
      atendimentosApi.listarDoAluno(aluno.id),
    ]).then(([m, a]) => {
      setMatriculas(m);
      setAtendimentos(a);
    }).finally(() => setLoading(false));
  }, [aluno.id]);

  const abertos = atendimentos.filter(a => a.status === "aberto").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card do perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-20 h-20 ${getColor(aluno.nome)} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                {getInitials(aluno.nome)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{aluno.nome}</h2>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Ativo
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-2">{aluno.email}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {aluno.telefone && <span>📞 {aluno.telefone}</span>}
                {matriculaAtiva && (
                  <>
                    <span>🌐 {matriculaAtiva.idioma} — {matriculaAtiva.nivel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onEditar}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Edit2 size={15} /> Editar
          </button>
        </div>

        {/* Barra de progresso */}
        {matriculaAtiva && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800 text-sm">Progresso — {matriculaAtiva.idioma} {matriculaAtiva.nivel}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{matriculaAtiva.professor}</span>
              </div>
              <span className="text-blue-600 font-bold text-sm">Em andamento</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "45%" }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Módulo atual</span>
              <span>Horário: {matriculaAtiva.horario}</span>
            </div>
          </div>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6">
        {([
          { id: "visao", label: "Visão Geral", icon: <User size={16} /> },
          { id: "historico", label: "Histórico", icon: <BookOpen size={16} /> },
          { id: "atendimentos", label: "Atendimentos", icon: <MessageSquare size={16} />, badge: abertos },
        ] as { id: Aba; label: string; icon: React.ReactNode; badge?: number }[]).map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              aba === a.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
            }`}>
            {a.icon} {a.label}
            {a.badge && a.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{a.badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-gray-400">Carregando...</div>}

      {/* VISÃO GERAL */}
      {!loading && aba === "visao" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-500" />
              <h3 className="font-bold text-gray-800">Dados Pessoais</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nome Completo", value: aluno.nome },
                { label: "E-mail", value: aluno.email },
                { label: "Telefone", value: aluno.telefone ?? "—" },
                { label: "CPF", value: aluno.cpf ?? "—" },
                { label: "Data de Nascimento", value: aluno.data_nasc ? new Date(aluno.data_nasc).toLocaleDateString("pt-BR") : "—" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Matrícula Atual + Ações */}
          <div className="space-y-4">
            {matriculaAtiva ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-blue-500" />
                  <h3 className="font-bold text-gray-800">Matrícula Atual</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Idioma", value: matriculaAtiva.idioma },
                    { label: "Nível", value: matriculaAtiva.nivel },
                    { label: "Modalidade", value: matriculaAtiva.modalidade },
                    { label: "Professor", value: matriculaAtiva.professor },
                    { label: "Horário", value: matriculaAtiva.horario },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                <BookOpen size={32} className="text-blue-400 mx-auto mb-2" />
                <p className="text-blue-700 font-medium mb-1">Nenhuma matrícula ativa</p>
                <p className="text-blue-500 text-sm">Explore nossas turmas e comece a aprender!</p>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-700 text-sm mb-3">Ações Rápidas</h4>
              <div className="space-y-2">
                <button onClick={onNovaMatricula}
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Nova Matrícula</span>
                  </div>
                  <span>→</span>
                </button>
                <button onClick={onAtendimento}
                  className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="text-sm font-medium">Atendimento</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO */}
      {!loading && aba === "historico" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Histórico de Matrículas</h3>
          {matriculas.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhuma matrícula encontrada.</p>
          ) : (
            <div className="space-y-3">
              {matriculas.map((m) => (
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
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    m.status === "ativa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ATENDIMENTOS */}
      {!loading && aba === "atendimentos" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Meus Atendimentos</h3>
            <button onClick={onAtendimento}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Calendar size={15} /> Abrir Novo
            </button>
          </div>
          {atendimentos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhum atendimento encontrado.</p>
          ) : (
            <div className="space-y-3">
              {atendimentos.map((a) => (
                <div key={a.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      a.status === "aberto" ? "bg-orange-100" : "bg-green-100"
                    }`}>
                      <MessageSquare size={18} className={a.status === "aberto" ? "text-orange-500" : "text-green-500"} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{a.tipo}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        {a.descricao && ` · ${a.descricao.slice(0, 40)}...`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    a.status === "aberto" ? "bg-orange-100 text-orange-700" :
                    a.status === "concluido" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

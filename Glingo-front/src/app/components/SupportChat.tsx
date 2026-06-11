import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { atendimentosApi, type Atendimento, type Mensagem } from "../../services/api";

const TIPOS = ["Dúvida", "Cancelamento", "Troca de turma", "Outro"];

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? "";

async function chamarGemini(mensagens: { role: string; text: string }[], tipo: string): Promise<string> {
  const sistema = `Você é a assistente virtual da Glingo, uma escola de idiomas. 
Seu nome é Glingo Assistant. Seja simpática, receptiva e use emojis com moderação.
O aluno abriu um atendimento do tipo: "${tipo}".
Você pode ajudar com dúvidas sobre turmas, horários, matrículas e informações gerais.
Para ações como trocar de turma ou cancelar matrícula, informe que um professor da equipe irá confirmar a solicitação.
Responda sempre em português brasileiro. Seja concisa mas acolhedora.`;

  const contents = mensagens.map((m) => ({
    role: m.role === "aluno" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sistema }] },
        contents,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Erro na API Gemini");
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Desculpe, não consegui responder agora. Um professor entrará em contato em breve!";
}

export default function SupportChat() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [selecionado, setSelecionado] = useState<Atendimento | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [novoTipo, setNovoTipo] = useState(TIPOS[0]);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const alunoRaw = sessionStorage.getItem("aluno");
  const aluno = alunoRaw ? JSON.parse(alunoRaw) : null;

  const carregarAtendimentos = async () => {
    if (!aluno) return;
    try {
      const lista = await atendimentosApi.listarDoAluno(aluno.id);
      setAtendimentos(lista);
      if (lista.length > 0 && !selecionado) setSelecionado(lista[0]);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    }
  };

  const carregarMensagens = async (id: number) => {
    try {
      const msgs = await atendimentosApi.listarMensagens(id);
      setMensagens(msgs);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch { }
  };

  useEffect(() => { carregarAtendimentos(); }, []);
  useEffect(() => { if (selecionado) carregarMensagens(selecionado.id); }, [selecionado]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !selecionado || !aluno) return;
    setLoadingMsg(true);
    const mensagemAluno = texto.trim();
    setTexto("");
    try {
      await atendimentosApi.enviarMensagem(selecionado.id, "aluno", mensagemAluno);
      await carregarMensagens(selecionado.id);
      const historico = mensagens.map((m) => ({ role: m.remetente, text: m.conteudo }));
      historico.push({ role: "aluno", text: mensagemAluno });
      const respostaIA = await chamarGemini(historico, selecionado.tipo);
      await atendimentosApi.enviarMensagem(selecionado.id, "admin", respostaIA);
      await carregarMensagens(selecionado.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao enviar mensagem");
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleAbrirChamado = async () => {
    if (!aluno) return;
    setAbrindo(true);
    try {
      const res = await atendimentosApi.abrir({ aluno_id: aluno.id, tipo: novoTipo, descricao: novaDescricao });
      const boasVindas = await chamarGemini([{ role: "aluno", text: `Olá! Abri um atendimento sobre "${novoTipo}". ${novaDescricao ? `Detalhes: ${novaDescricao}` : ""}` }], novoTipo);
      await atendimentosApi.enviarMensagem(res.id, "admin", boasVindas);
      setNovaDescricao("");
      await carregarAtendimentos();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao abrir chamado");
    } finally {
      setAbrindo(false);
    }
  };

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (!aluno) {
    return (
      <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <p className="text-yellow-800">Faça login para acessar o atendimento.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-[#1e4d7b] text-white p-4">
        <h2 className="text-xl font-semibold">💬 Atendimento</h2>
        <p className="text-blue-200 text-sm">Assistente virtual da Glingo</p>
      </div>
      <div className="p-6">
        {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{erro}</div>}

        {atendimentos.length > 0 && (
          <div className="mb-4">
            <select value={selecionado?.id ?? ""} onChange={(e) => { const at = atendimentos.find((a) => a.id === Number(e.target.value)); setSelecionado(at ?? null); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              {atendimentos.map((a) => (
                <option key={a.id} value={a.id}>#{String(a.id).padStart(3, "0")} — {a.tipo} ({a.status})</option>
              ))}
            </select>
          </div>
        )}

        {selecionado ? (
          <>
            <div className="mb-3">
              <h3 className="font-semibold text-gray-800">Atendimento #{String(selecionado.id).padStart(3, "0")} — {selecionado.tipo}</h3>
              <p className="text-sm text-gray-500 capitalize">{selecionado.status}</p>
            </div>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
              {mensagens.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Sem mensagens ainda.</p>}
              {mensagens.map((msg) => {
                const isAluno = msg.remetente === "aluno";
                return (
                  <div key={msg.id} className={`flex ${isAluno ? "justify-end" : "justify-start"}`}>
                    {!isAluno && (
                      <div className="w-8 h-8 rounded-full bg-[#1e4d7b] text-white flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-1">G</div>
                    )}
                    <div className={`max-w-sm rounded-2xl px-4 py-3 ${isAluno ? "bg-[#2563eb] text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"}`}>
                      <p className="text-sm leading-relaxed">{msg.conteudo}</p>
                      <p className={`text-xs mt-1 ${isAluno ? "text-blue-100" : "text-gray-400"}`}>{formatHora(msg.data_envio)} · {isAluno ? "Você" : "Glingo"}</p>
                    </div>
                  </div>
                );
              })}
              {loadingMsg && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#1e4d7b] text-white flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">G</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={msgEndRef} />
            </div>
            <form onSubmit={handleEnviar} className="flex gap-2">
              <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sua mensagem..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loadingMsg} />
              <button type="submit" disabled={loadingMsg || !texto.trim()}
                className="bg-[#2563eb] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors flex items-center gap-2 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <p className="text-gray-500 text-center py-6">Nenhum atendimento aberto.</p>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Abrir novo atendimento</h4>
          <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <textarea value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)}
            placeholder="Descreva sua dúvida ou solicitação (opcional)" rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none" />
          <button disabled={abrindo} onClick={handleAbrirChamado}
            className="w-full bg-[#1e4d7b] text-white py-3 rounded-xl font-semibold hover:bg-[#163a5e] transition-colors disabled:opacity-50">
            {abrindo ? "Abrindo..." : "Abrir chamado"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Serviço de API — Glingo
const BASE_URL = "http://127.0.0.1:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.erro ?? `Erro ${res.status}`);
  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  data_nasc?: string;
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
  ra: string;
  especialidade?: string;
  telefone?: string;
}

export interface Turma {
  id: number;
  idioma: string;
  nivel: string;
  professor: string;
  horario: string;
  modalidade: string;
  vagas_total: number;
  vagas_restantes: number;
}

export interface Idioma {
  id: number;
  nome: string;
}

export interface Matricula {
  id: number;
  idioma: string;
  nivel: string;
  professor: string;
  horario: string;
  modalidade: string;
  data_matricula: string;
  status: "ativa" | "cancelada";
}

export interface Atendimento {
  id: number;
  aluno_id: number;
  tipo: string;
  descricao?: string;
  status: string;
  created_at: string;
}

export interface Mensagem {
  id: number;
  remetente: string;
  conteudo: string;
  tipo?: string;
  data_envio: string;
}

// ─── Alunos ──────────────────────────────────────────────────────────────────

export const alunosApi = {
  listar: () => request<Aluno[]>("/alunos"),
  buscar: (id: number) => request<Aluno>(`/alunos/${id}`),
  cadastrar: (dados: {
    nome: string; cpf: string; email: string;
    senha: string; telefone: string; data_nasc?: string;
  }) => request<{ mensagem: string; id: number }>("/alunos", {
    method: "POST", body: JSON.stringify(dados),
  }),
  login: (email: string, senha: string) =>
    request<{ mensagem: string; aluno: Aluno }>("/login", {
      method: "POST", body: JSON.stringify({ email, senha }),
    }),
};

// ─── Professores ─────────────────────────────────────────────────────────────

export const professoresApi = {
  listar: () => request<Professor[]>("/professores"),
  cadastrar: (dados: {
    nome: string; email: string; senha: string;
    ra: string; telefone?: string; especialidade?: string;
  }) => request<{ mensagem: string; id: number }>("/professores", {
    method: "POST", body: JSON.stringify(dados),
  }),
  login: (email: string, senha: string) =>
    request<{ mensagem: string; professor: Professor }>("/professores/login", {
      method: "POST", body: JSON.stringify({ email, senha }),
    }),
};

// ─── Turmas ──────────────────────────────────────────────────────────────────

export const turmasApi = {
  listarIdiomas: () => request<Idioma[]>("/idiomas"),
  listar: (filtros?: { idioma_id?: number; nivel?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.idioma_id) params.set("idioma_id", String(filtros.idioma_id));
    if (filtros?.nivel) params.set("nivel", filtros.nivel);
    const qs = params.toString() ? `?${params}` : "";
    return request<Turma[]>(`/turmas${qs}`);
  },
  buscar: (id: number) => request<Turma>(`/turmas/${id}`),
  cadastrar: (dados: {
    idioma_id: number; nivel: string; professor: string;
    horario: string; modalidade: string; vagas_total: number;
  }) => request<{ mensagem: string; id: number }>("/turmas", {
    method: "POST", body: JSON.stringify(dados),
  }),
};

// ─── Matrículas ──────────────────────────────────────────────────────────────

export const matriculasApi = {
  listarDoAluno: (aluno_id: number) =>
    request<Matricula[]>(`/matriculas/aluno/${aluno_id}`),
  realizar: (aluno_id: number, turma_id: number) =>
    request<{ mensagem: string; id: number }>("/matriculas", {
      method: "POST", body: JSON.stringify({ aluno_id, turma_id }),
    }),
  cancelar: (id: number) =>
    request<{ mensagem: string }>(`/matriculas/${id}/cancelar`, { method: "PATCH" }),
};

// ─── Atendimentos ────────────────────────────────────────────────────────────

export const atendimentosApi = {
  listarDoAluno: (aluno_id: number) =>
    request<Atendimento[]>(`/atendimentos/aluno/${aluno_id}`),
  listarTodos: () => request<Atendimento[]>("/atendimentos"),
  abrir: (dados: { aluno_id: number; tipo: string; descricao?: string }) =>
    request<{ mensagem: string; id: number }>("/atendimentos", {
      method: "POST", body: JSON.stringify(dados),
    }),
  listarMensagens: (atendimento_id: number) =>
    request<Mensagem[]>(`/atendimentos/${atendimento_id}/mensagens`),
  enviarMensagem: (atendimento_id: number, remetente: string, conteudo: string) =>
    request<{ mensagem: string }>(`/atendimentos/${atendimento_id}/mensagens`, {
      method: "POST", body: JSON.stringify({ remetente, conteudo }),
    }),
};

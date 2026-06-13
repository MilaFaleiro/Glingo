interface Props { onVoltar: () => void; }

export default function NotFound({ onVoltar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h2 className="text-4xl font-bold text-gray-800 mb-3">Página não encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Ops! A página que você está procurando não existe ou foi movida.
      </p>
      <button onClick={onVoltar}
        className="bg-[#2563eb] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e4d7b] transition-colors">
        Voltar ao início
      </button>
    </div>
  );
}

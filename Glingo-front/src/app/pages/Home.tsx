import { Link } from "react-router";
import { Sparkles, Users, Globe, Trophy, ArrowRight, Star } from "lucide-react";
import LanguageCard from "../components/LanguageCard";

export default function Home() {
  const languages = [
    { flag: "🇺🇸", name: "Inglês", status: "Vagas abertas" },
    { flag: "🇪🇸", name: "Espanhol", status: "Vagas abertas" },
    { flag: "🇧🇷", name: "Português", status: "Últimas vagas" },
    { flag: "🇨🇳", name: "Mandarim", status: "Vagas abertas" }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white rounded-3xl p-12 md:p-16 mb-12 overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Transforme seu futuro com idiomas</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Aprenda um idioma novo
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Inglês · Espanhol · Português · Mandarim
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Começar agora
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/turmas"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30"
            >
              Ver turmas
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
          <div className="text-sm text-blue-700">Alunos ativos</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">25+</div>
          <div className="text-sm text-purple-700">Professores</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">4.9</div>
          <div className="text-sm text-green-700">Avaliação média</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border border-orange-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">15+</div>
          <div className="text-sm text-orange-700">Anos de experiência</div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-gray-900">Nossos cursos</h3>
          <Link to="/turmas" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {languages.map((lang) => (
            <LanguageCard
              key={lang.name}
              flag={lang.flag}
              name={lang.name}
              status={lang.status}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Users className="text-white" size={28} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Professores qualificados</h4>
          <p className="text-gray-600">Aprenda com os melhores profissionais do mercado</p>
        </div>
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Globe className="text-white" size={28} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Online ou presencial</h4>
          <p className="text-gray-600">Escolha a modalidade que melhor se adapta a você</p>
        </div>
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all border border-gray-100 hover:border-green-200 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Trophy className="text-white" size={28} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Certificado reconhecido</h4>
          <p className="text-gray-600">Receba certificação ao concluir o curso</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 border border-gray-200">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">O que nossos alunos dizem</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FCD34D" className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">"Excelente metodologia! Em 6 meses já consegui ter conversas fluentes em inglês."</p>
            <div className="font-semibold text-gray-900">Ana Paula</div>
            <div className="text-sm text-gray-500">Curso de Inglês</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FCD34D" className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">"Professores incríveis e material didático muito completo. Super recomendo!"</p>
            <div className="font-semibold text-gray-900">Carlos Eduardo</div>
            <div className="text-sm text-gray-500">Curso de Espanhol</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FCD34D" className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">"A flexibilidade das aulas online me permitiu estudar no meu ritmo. Adorei!"</p>
            <div className="font-semibold text-gray-900">Juliana Santos</div>
            <div className="text-sm text-gray-500">Curso de Mandarim</div>
          </div>
        </div>
      </div>
    </>
  );
}

import { CheckCircle2, AlertCircle } from "lucide-react";

interface LanguageCardProps {
  flag: string;
  name: string;
  status: string;
}

export default function LanguageCard({ flag, name, status }: LanguageCardProps) {
  const getStatusStyles = () => {
    if (status.includes('abertas')) {
      return {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle2 size={16} className="text-green-600" />
      };
    }
    if (status.includes('Últimas')) {
      return {
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <AlertCircle size={16} className="text-orange-600" />
      };
    }
    return {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <CheckCircle2 size={16} className="text-gray-600" />
    };
  };

  const statusStyles = getStatusStyles();

  return (
    <div className="group bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:border-blue-300 hover:-translate-y-1 cursor-pointer">
      <div className="text-6xl group-hover:scale-110 transition-transform">{flag}</div>
      <h3 className="font-bold text-xl text-gray-900">{name}</h3>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusStyles.bgColor} border ${statusStyles.borderColor}`}>
        {statusStyles.icon}
        <span className={`text-sm font-medium ${statusStyles.color}`}>{status}</span>
      </div>
    </div>
  );
}

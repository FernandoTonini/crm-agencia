import { X } from 'lucide-react';

const SERVICE_COLORS = {
  'Tráfego Pago': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  'Mídias Sociais': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  'Desenvolvimento de Site': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  'SEO': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  'Email Marketing': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  'Design Gráfico': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  'Copywriting': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  'Consultoria': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/50' },
};

export const ServiceTag = ({ service, onRemove, editable = false }) => {
  const colors = SERVICE_COLORS[service] || {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/50'
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {service}
      {editable && onRemove && (
        <button
          onClick={() => onRemove(service)}
          className="hover:opacity-70 transition-opacity"
          title="Remover serviço"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
};

export const ServiceTagList = ({ services = [], onRemove, editable = false }) => {
  if (!services || services.length === 0) {
    return <span className="text-gray-500 text-sm">Nenhum serviço contratado</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {services.map((service, idx) => (
        <ServiceTag
          key={idx}
          service={service}
          onRemove={onRemove}
          editable={editable}
        />
      ))}
    </div>
  );
};


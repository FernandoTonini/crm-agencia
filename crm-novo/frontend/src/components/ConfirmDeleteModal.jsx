import { AlertTriangle } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  title = 'Confirmar Deleção',
  message = 'Tem certeza que deseja deletar este item?',
  itemName = '',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle
            size={24}
            className={isDangerous ? 'text-red-400' : 'text-yellow-400'}
          />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        <p className="text-gray-400 mb-2">{message}</p>

        {itemName && (
          <div className="bg-gray-800 p-3 rounded mb-4">
            <p className="text-sm text-gray-500">Item a deletar:</p>
            <p className="text-white font-semibold">{itemName}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          ⚠️ Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded transition-colors disabled:opacity-50 text-white ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isLoading ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
};


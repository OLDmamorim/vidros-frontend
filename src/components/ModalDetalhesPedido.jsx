import { useEffect, useState } from 'react';
import { pedidosAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Loader2, Calendar, User, Package, MessageSquare, Image as ImageIcon } from 'lucide-react';

export default function ModalDetalhesPedido({ pedidoId, isOpen, onClose, onUpdate }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fotoSelecionada, setFotoSelecionada] = useState(null);

  useEffect(() => {
    if (isOpen && pedidoId) {
      loadPedido();
    }
  }, [isOpen, pedidoId]);

  const loadPedido = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await pedidosAPI.getPedido(pedidoId);
      setPedido(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pendente: { label: 'Pendente', color: 'bg-yellow-500' },
      em_progresso: { label: 'Em Progresso', color: 'bg-blue-500' },
      respondido: { label: 'Respondido', color: 'bg-yellow-400' },
      aguarda_resposta: { label: 'Aguarda Resposta', color: 'bg-yellow-400' },
      encontrado: { label: 'Encontrado', color: 'bg-green-500' },
      concluido: { label: 'Concluído', color: 'bg-green-600' },
      cancelado: { label: 'Cancelado', color: 'bg-red-500' }
    };
    return configs[status] || configs.pendente;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    setPedido(null);
    setFotoSelecionada(null);
    onClose();
    if (onUpdate) onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">
              {pedido?.matricula || 'Detalhes do Pedido'}
            </h2>
            {pedido && (
              <Badge className={`${getStatusConfig(pedido.status).color} text-white`}>
                {getStatusConfig(pedido.status).label}
              </Badge>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : pedido ? (
            <div className="space-y-6">
              {/* Informações do Veículo */}
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Informações do Veículo
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Matrícula:</span>
                    <p className="text-white font-mono font-bold text-lg">{pedido.matricula}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Marca:</span>
                    <p className="text-white font-semibold">{pedido.marca_carro}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Modelo:</span>
                    <p className="text-white font-semibold">{pedido.modelo_carro}</p>
                  </div>
                  {pedido.ano_carro && (
                    <div>
                      <span className="text-gray-400">Ano:</span>
                      <p className="text-white">{pedido.ano_carro}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-gray-400">Tipo de Vidro:</span>
                    <p className="text-white font-semibold">{pedido.tipo_vidro}</p>
                  </div>
                  {pedido.descricao && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Descrição:</span>
                      <p className="text-white">{pedido.descricao}</p>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-600 text-xs text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    Criado em {formatDate(pedido.created_at)}
                  </div>
                  <div className="flex items-center mt-1">
                    <User className="mr-1 h-3 w-3" />
                    Por {pedido.user_name}
                  </div>
                </div>
              </div>

              {/* Fotos */}
              {pedido.fotos && pedido.fotos.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Fotos ({pedido.fotos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pedido.fotos.map((foto, index) => (
                      <div
                        key={foto.id}
                        className="relative group cursor-pointer"
                        onClick={() => setFotoSelecionada(foto.foto_url)}
                      >
                        <img
                          src={foto.foto_url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-600 hover:border-blue-500 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atualizações / Respostas do Departamento */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Atualizações ({pedido.updates?.length || 0})
                </h3>
                
                {pedido.updates && pedido.updates.length > 0 ? (
                  <div className="space-y-3">
                    {pedido.updates.map((update) => (
                      <div
                        key={update.id}
                        className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-white">
                              {update.user_name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(update.created_at)}
                          </span>
                        </div>
                        <p className="text-white whitespace-pre-wrap">{update.mensagem}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Ainda não há atualizações para este pedido</p>
                  </div>
                )}
              </div>

              {/* Botão Fechar */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-500 text-white"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de Foto em Tamanho Grande */}
      {fotoSelecionada && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setFotoSelecionada(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setFotoSelecionada(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={fotoSelecionada}
              alt="Foto ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

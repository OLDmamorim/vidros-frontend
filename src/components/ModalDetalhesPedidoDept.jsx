import { useEffect, useState } from 'react';
import { pedidosAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2, Calendar, User, Package, MessageSquare, Image as ImageIcon, Euro, Save, Plus } from 'lucide-react';

export default function ModalDetalhesPedidoDept({ pedidoId, isOpen, onClose, onUpdate }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  
  // Campos editáveis
  const [status, setStatus] = useState('');
  const [valor, setValor] = useState('');
  const [custo, setCusto] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  
  // Nova atualização
  const [novaMensagem, setNovaMensagem] = useState('');
  const [visivelLoja, setVisivelLoja] = useState(true);

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
      setStatus(data.status);
      setValor(data.valor || '');
      setCusto(data.custo || '');
      setFornecedor(data.fornecedor || '');
    } catch (err) {
      setError(err.message || 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await pedidosAPI.updatePedido(pedidoId, {
        status,
        valor: valor ? parseFloat(valor) : null,
        custo: custo ? parseFloat(custo) : null,
        fornecedor: fornecedor || null
      });

      if (onUpdate) onUpdate();
      onClose(); // Fechar modal após salvar
    } catch (err) {
      setError(err.message || 'Erro ao guardar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!novaMensagem.trim()) return;

    try {
      setSaving(true);
      setError('');
      
      await pedidosAPI.addUpdate(pedidoId, {
        mensagem: novaMensagem,
        visivel_loja: visivelLoja
      });

      if (onUpdate) onUpdate();
      onClose(); // Fechar modal após adicionar update
    } catch (err) {
      console.error('Erro detalhado ao adicionar update:', err);
      setError(err.message || 'Erro ao adicionar atualização');
    } finally {
      setSaving(false);
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
    setNovaMensagem('');
    onClose();
    if (onUpdate) onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white font-mono">
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
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : pedido ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COLUNA ESQUERDA - Informações da Loja */}
              <div className="space-y-6">
                {/* Informações do Veículo */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-gray-600 pb-2">
                    <Package className="mr-2 h-5 w-5 text-blue-400" />
                    Informações do Pedido
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Matrícula</span>
                        <p className="text-white font-mono font-bold text-xl">{pedido.matricula}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Ano</span>
                        <p className="text-white font-semibold">{pedido.ano_carro || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Marca</span>
                      <p className="text-white font-semibold text-lg">{pedido.marca_carro}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Modelo</span>
                      <p className="text-white font-semibold text-lg">{pedido.modelo_carro}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-600">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Tipo de Vidro</span>
                      <p className="text-white font-semibold">{pedido.tipo_vidro}</p>
                    </div>
                    
                    {pedido.descricao && (
                      <div className="pt-2 border-t border-gray-600">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Descrição / Observações</span>
                        <p className="text-white mt-1 text-sm">{pedido.descricao}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-600">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Loja</span>
                      <p className="text-white font-semibold">{pedido.loja_name}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-600 text-xs text-gray-400 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      Criado em {formatDate(pedido.created_at)}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      Por {pedido.user_name}
                    </div>
                  </div>
                </div>

                {/* Fotos */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-gray-600 pb-2">
                    <ImageIcon className="mr-2 h-5 w-5 text-blue-400" />
                    Fotos ({pedido.fotos?.length || 0})
                  </h3>
                  {pedido.fotos && pedido.fotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {pedido.fotos.map((foto, index) => (
                        <div
                          key={foto.id}
                          className="relative group cursor-pointer"
                          onClick={() => setFotoSelecionada(foto.foto_url)}
                        >
                          <img
                            src={foto.foto_url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-600 hover:border-blue-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Ver Ampliada
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">Sem fotos anexadas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUNA DIREITA - Gestão do Departamento */}
              <div className="space-y-6">
                {/* Gestão do Pedido */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-gray-600 pb-2">
                    <Package className="mr-2 h-5 w-5 text-green-400" />
                    Gestão do Pedido
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                        Status <span className="text-green-400">(Visível para Loja)</span>
                      </label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_progresso">Em Progresso</SelectItem>
                          <SelectItem value="encontrado">Encontrado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valor (Visível para Loja) */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                        Valor <span className="text-green-400">(Visível para Loja)</span>
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          placeholder="0.00"
                          className="pl-10 bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    {/* Custo (Apenas Departamento) */}
                    <div className="pt-3 border-t border-gray-600">
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                        Custo <span className="text-red-400">(Apenas Departamento)</span>
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={custo}
                          onChange={(e) => setCusto(e.target.value)}
                          placeholder="0.00"
                          className="pl-10 bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    {/* Fornecedor (Apenas Departamento) */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
                        Fornecedor <span className="text-red-400">(Apenas Departamento)</span>
                      </label>
                      <Input
                        type="text"
                        value={fornecedor}
                        onChange={(e) => setFornecedor(e.target.value.toUpperCase())}
                        placeholder="Nome do fornecedor"
                        className="bg-gray-800 border-gray-600 text-white uppercase"
                      />
                    </div>

                    {/* Botão Guardar */}
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A guardar...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Histórico Completo */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-gray-600 pb-2">
                    <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
                    Histórico Completo ({pedido.updates?.length || 0})
                  </h3>
                  
                  {pedido.updates && pedido.updates.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {pedido.updates.map((update) => {
                        const isDepartamento = update.user_role === 'departamento' || update.user_role === 'admin';
                        return (
                          <div
                            key={update.id}
                            className={`rounded-lg p-4 border-l-4 ${
                              isDepartamento 
                                ? 'bg-gray-600 border-purple-400' 
                                : 'bg-gray-800 border-blue-500'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isDepartamento ? 'bg-purple-500' : 'bg-blue-600'
                                }`}>
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-white">
                                    {update.user_name}
                                  </span>
                                  <p className="text-xs text-gray-400">
                                    {formatDate(update.created_at)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className={update.visivel_loja ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}>
                                {update.visivel_loja ? 'Visível' : 'Interna'}
                              </Badge>
                            </div>
                            <p className="text-white text-sm whitespace-pre-wrap ml-10">
                              {update.conteudo || update.mensagem}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">Ainda não há atualizações</p>
                    </div>
                  )}
                </div>

                {/* Adicionar Atualização */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-gray-600 pb-2">
                    <Plus className="mr-2 h-5 w-5 text-purple-400" />
                    Nova Atualização
                  </h3>
                  
                  <div className="space-y-4">
                    <Textarea
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      placeholder="Escreva uma atualização, resposta ou nota..."
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visivel"
                        checked={visivelLoja}
                        onCheckedChange={setVisivelLoja}
                        className="border-gray-600"
                      />
                      <label
                        htmlFor="visivel"
                        className="text-sm text-white cursor-pointer"
                      >
                        Visível para a loja
                      </label>
                    </div>

                    <Button
                      onClick={handleAddUpdate}
                      disabled={saving || !novaMensagem.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Atualização
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Botão Fechar */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-700">
            <Button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-500 text-white px-8"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Foto em Tamanho Grande */}
      {fotoSelecionada && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4"
          onClick={() => setFotoSelecionada(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setFotoSelecionada(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-gray-800 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={fotoSelecionada}
              alt="Foto ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

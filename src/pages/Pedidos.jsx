import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package, Calendar, Image as ImageIcon, MessageSquare, X } from 'lucide-react';
import ModalDetalhesPedidoDept from '../components/ModalDetalhesPedidoDept';

export default function Pedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await pedidosAPI.getPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const contarPorStatus = (status) => {
    return pedidos.filter(p => p.status === status).length;
  };

  const contarComAtualizacoes = (status) => {
    return pedidos.filter(p => p.status === status && p.tem_atualizacoes_novas).length;
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro de status
    if (filtroStatus && pedido.status !== filtroStatus) {
      return false;
    }

    // Ocultar cancelados por padrão (exceto se filtro ativo)
    if (!filtroStatus && pedido.status === 'cancelado') {
      return false;
    }

    // Filtro de pesquisa
    if (pesquisa) {
      const termo = pesquisa.toLowerCase();
      return (
        pedido.matricula?.toLowerCase().includes(termo) ||
        pedido.marca_carro?.toLowerCase().includes(termo) ||
        pedido.modelo_carro?.toLowerCase().includes(termo) ||
        pedido.tipo_vidro?.toLowerCase().includes(termo) ||
        pedido.loja_name?.toLowerCase().includes(termo)
      );
    }

    return true;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pendente: { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-yellow-300' },
      em_progresso: { label: 'A Tratar', color: 'bg-blue-500', textColor: 'text-blue-300' },
      encontrado: { label: 'Encomendado', color: 'bg-green-500', textColor: 'text-green-300' },
      concluido: { label: 'Concluído', color: 'bg-green-600', textColor: 'text-green-300' },
      cancelado: { label: 'Cancelado', color: 'bg-red-500', textColor: 'text-red-300' }
    };
    return configs[status] || configs.pendente;
  };

  const devePiscar = (pedido) => {
    const statusPiscantes = ['respondido', 'aguarda_resposta'];
    return statusPiscantes.includes(pedido.status) && pedido.tem_atualizacoes_novas === true;
  };

  const handlePedidoClick = (pedido) => {
    setPedidoSelecionado(pedido.id);
    setModalDetalhesOpen(true);
  };

  const handleCloseDetalhes = () => {
    setModalDetalhesOpen(false);
    setPedidoSelecionado(null);
    loadData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Pedidos</h1>
            <p className="text-gray-400 mt-1">Departamento de Vidros Especiais</p>
          </div>
        </div>

        {/* Dashboard de Totalizadores */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { status: 'pendente', label: 'Pendente', color: 'bg-yellow-500' },
            { status: 'em_progresso', label: 'A Tratar', color: 'bg-blue-500' },
            { status: 'encontrado', label: 'Encomendado', color: 'bg-green-500' },
            { status: 'concluido', label: 'Concluído', color: 'bg-green-600' },
            { status: 'cancelado', label: 'Cancelado', color: 'bg-red-500' }
          ].map(({ status, label, color }) => {
            const total = contarPorStatus(status);
            const comAtualizacoes = contarComAtualizacoes(status);
            const pisca = false; // Removido lógica de piscar para respondido/aguarda_resposta

            return (
              <Card
                key={status}
                className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:scale-105 ${
                  filtroStatus === status ? 'ring-2 ring-blue-500' : ''
                } ${pisca ? 'animate-pulse' : ''}`}
                onClick={() => setFiltroStatus(filtroStatus === status ? null : status)}
              >
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getStatusConfig(status).textColor}`}>
                      {total}
                    </div>
                    <div className="text-sm text-gray-400 mt-2 min-h-[32px] flex items-center justify-center">{label}</div>
                    {comAtualizacoes > 0 && (
                      <div className="text-xs text-yellow-400 mt-1">
                        ({comAtualizacoes} novos)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Campo de Pesquisa */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar por matrícula, marca, modelo, tipo de vidro ou loja..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value.toUpperCase())}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 uppercase"
            />
          </div>
          {filtroStatus && (
            <Button 
              onClick={() => setFiltroStatus(null)}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtro
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {filtroStatus ? `Pedidos: ${getStatusConfig(filtroStatus).label}` : 'Pedidos Ativos'}
          </h2>
          <span className="text-gray-400 text-sm">{pedidosFiltrados.length} pedido(s)</span>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pedidosFiltrados.map((pedido) => (
              <Card
                key={pedido.id}
                className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                  devePiscar(pedido) ? 'animate-pulse ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => handlePedidoClick(pedido)}
              >
                <CardContent className="p-5">
                  {/* Matrícula e Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl font-bold text-blue-300 font-mono">
                      {pedido.matricula}
                    </div>
                    <Badge className={`${getStatusConfig(pedido.status).color} text-white text-xs`}>
                      {getStatusConfig(pedido.status).label}
                    </Badge>
                  </div>

                  {/* Marca e Modelo */}
                  <div className="mb-3">
                    <div className="text-white font-semibold text-lg">
                      {pedido.marca_carro} {pedido.modelo_carro}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Ano: {pedido.ano_carro || 'N/A'}
                    </div>
                  </div>

                  {/* Tipo de Vidro */}
                  <div className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {pedido.tipo_vidro}
                  </div>

                  {/* Loja */}
                  <div className="text-gray-400 text-xs mb-3 pb-3 border-b border-gray-700">
                    <Package className="inline h-3 w-3 mr-1" />
                    {pedido.loja_name}
                  </div>

                  {/* Rodapé */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(pedido.created_at)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {pedido.total_fotos || 0}
                      </span>
                      <span className={`flex items-center ${devePiscar(pedido) ? 'text-yellow-400 font-bold' : ''}`}>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {pedido.total_updates || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <ModalDetalhesPedidoDept
        pedidoId={pedidoSelecionado}
        isOpen={modalDetalhesOpen}
        onClose={handleCloseDetalhes}
        onUpdate={loadData}
      />
    </div>
  );
}

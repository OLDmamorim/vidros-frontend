import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI, adminAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Clock, TrendingUp, Plus, Search } from 'lucide-react';
import ModalNovoPedido from '../components/ModalNovoPedido';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [pedidosStats, setPedidosStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [pesquisa, setPesquisa] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroStatus, pesquisa, pedidos]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const pedidosData = await pedidosAPI.getPedidos();
      setPedidos(pedidosData);

      if (user?.role === 'loja') {
        const statusCount = {
          pendente: 0,
          em_progresso: 0,
          respondido: 0,
          aguarda_resposta: 0,
          encontrado: 0,
          concluido: 0,
          cancelado: 0
        };

        pedidosData.forEach(pedido => {
          if (statusCount.hasOwnProperty(pedido.status)) {
            statusCount[pedido.status]++;
          }
        });

        setPedidosStats(statusCount);
      }

      if (user?.role === 'admin') {
        const statsData = await adminAPI.getStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pedidos];

    if (filtroStatus) {
      resultado = resultado.filter(p => p.status === filtroStatus);
    }

    if (pesquisa.trim()) {
      const termo = pesquisa.toLowerCase();
      resultado = resultado.filter(p => 
        p.matricula?.toLowerCase().includes(termo) ||
        p.marca_carro?.toLowerCase().includes(termo) ||
        p.modelo_carro?.toLowerCase().includes(termo) ||
        p.tipo_vidro?.toLowerCase().includes(termo)
      );
    }

    setPedidosFiltrados(resultado);
  };

  const handleStatusClick = (status) => {
    if (filtroStatus === status) {
      setFiltroStatus(null);
    } else {
      setFiltroStatus(status);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pendente: { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
      em_progresso: { label: 'Em Progresso', color: 'bg-blue-500', textColor: 'text-blue-400' },
      respondido: { label: 'Respondido', color: 'bg-yellow-400', textColor: 'text-yellow-300' },
      aguarda_resposta: { label: 'Aguarda Resposta', color: 'bg-yellow-400', textColor: 'text-yellow-300' },
      encontrado: { label: 'Encontrado', color: 'bg-green-500', textColor: 'text-green-400' },
      concluido: { label: 'Concluído', color: 'bg-green-600', textColor: 'text-green-500' },
      cancelado: { label: 'Cancelado', color: 'bg-red-500', textColor: 'text-red-400' }
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

  const isPendente = (status) => {
    return status === 'respondido' || status === 'aguarda_resposta';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${user?.role === 'loja' ? 'min-h-screen bg-gray-800 -m-6 p-6' : ''}`}>
      {/* Header com Botão Criar Pedido */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${user?.role === 'loja' ? 'text-white' : 'text-gray-900'}`}>
            Bem-vindo, {user?.name}
          </h1>
          <p className={`mt-2 ${user?.role === 'loja' ? 'text-gray-300' : 'text-gray-600'}`}>
            {user?.role === 'admin' && 'Painel de Administração'}
            {user?.role === 'loja' && `Loja: ${user?.loja_name}`}
            {user?.role === 'departamento' && 'Departamento de Vidros Especiais'}
          </p>
        </div>
        
        {user?.role === 'loja' && (
          <Button 
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Pedido
          </Button>
        )}
      </div>

      {/* Totalizadores para Loja */}
      {user?.role === 'loja' && pedidosStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(pedidosStats).map(([status, count]) => {
            const config = getStatusConfig(status);
            const isActive = filtroStatus === status;
            const shouldPulse = isPendente(status);
            
            return (
              <Card 
                key={status}
                className={`bg-gray-700 border-gray-600 cursor-pointer transition-all hover:scale-105 ${
                  shouldPulse ? 'animate-pulse' : ''
                } ${isActive ? `ring-2 ring-${config.color.replace('bg-', '')}` : ''}`}
                onClick={() => handleStatusClick(status)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-300">{config.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${config.textColor} ${shouldPulse ? 'animate-pulse' : ''}`}>
                    {count}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Campo de Pesquisa (apenas para loja) */}
      {user?.role === 'loja' && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar por matrícula, marca, modelo ou tipo de vidro..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          {filtroStatus && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltroStatus(null)}
              className="bg-gray-600 text-white border-gray-500 hover:bg-gray-500"
            >
              Limpar Filtro
            </Button>
          )}
        </div>
      )}

      {/* Estatísticas (apenas para admin) */}
      {user?.role === 'admin' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_lojas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilizadores</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_pedidos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pedidos_por_status?.find(s => s.status === 'pendente')?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid de Pedidos em Cartões Quadrados */}
      {user?.role === 'loja' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {filtroStatus ? `${getStatusConfig(filtroStatus).label}` : 'Todos os Pedidos'}
            </h2>
            <span className="text-gray-400 text-sm">{pedidosFiltrados.length} pedido(s)</span>
          </div>

          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-gray-700 rounded-lg">
              <Package className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-300">
                {pesquisa || filtroStatus ? 'Nenhum pedido encontrado com esses critérios' : 'Nenhum pedido registado'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pedidosFiltrados.map((pedido) => {
                const statusConfig = getStatusConfig(pedido.status);
                const shouldPulse = isPendente(pedido.status);
                
                return (
                  <Card
                    key={pedido.id}
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                    className={`bg-gray-700 border-gray-600 cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                      shouldPulse ? 'animate-pulse ring-2 ring-yellow-400' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-2xl text-blue-300">
                          {pedido.matricula || '---'}
                        </span>
                        <Badge className={`${statusConfig.color} text-white`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="font-semibold text-white text-lg">
                          {pedido.marca_carro} {pedido.modelo_carro}
                        </p>
                        {pedido.ano_carro && (
                          <p className="text-sm text-gray-400">Ano: {pedido.ano_carro}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {pedido.tipo_vidro}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-600">
                        <span>{formatDate(pedido.created_at)}</span>
                        <div className="flex space-x-2">
                          {pedido.total_fotos > 0 && (
                            <span>📷 {pedido.total_fotos}</span>
                          )}
                          {pedido.total_updates > 0 && (
                            <span className={shouldPulse ? 'font-bold text-yellow-400' : ''}>
                              💬 {pedido.total_updates}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Novo Pedido */}
      <ModalNovoPedido 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

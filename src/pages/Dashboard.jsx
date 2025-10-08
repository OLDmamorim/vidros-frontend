import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI, adminAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Clock, TrendingUp, Plus, Search } from 'lucide-react';
import ModalNovoPedido from '../components/ModalNovoPedido';
import ModalDetalhesPedido from '../components/ModalDetalhesPedido';
import ModalDetalhesPedidoDept from '../components/ModalDetalhesPedidoDept';

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
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

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

      // Calcular estatísticas para loja e departamento
      if (user?.role === 'loja' || user?.role === 'departamento') {
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

    // Ocultar cancelados por padrão (só mostra se filtro ativo)
    if (filtroStatus !== 'cancelado') {
      resultado = resultado.filter(p => p.status !== 'cancelado');
    }

    // Filtro por status
    if (filtroStatus) {
      resultado = resultado.filter(p => p.status === filtroStatus);
    }

    // Filtro por pesquisa
    if (pesquisa.trim()) {
      const termo = pesquisa.toLowerCase();
      resultado = resultado.filter(p => 
        p.matricula?.toLowerCase().includes(termo) ||
        p.marca_carro?.toLowerCase().includes(termo) ||
        p.modelo_carro?.toLowerCase().includes(termo) ||
        p.tipo_vidro?.toLowerCase().includes(termo) ||
        p.loja_name?.toLowerCase().includes(termo)
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

  // Verifica se deve piscar: tem atualizações novas E está em status respondido/aguarda_resposta
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
    loadData(); // Recarrega para atualizar status de visualização
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${(user?.role === 'loja' || user?.role === 'departamento') ? 'min-h-screen bg-gray-800 -m-6 p-6' : ''}`}>
      {/* Header com Botão Criar Pedido */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${(user?.role === 'loja' || user?.role === 'departamento') ? 'text-white' : 'text-gray-900'}`}>
            Bem-vindo, {user?.name}
          </h1>
          <p className={`mt-2 ${(user?.role === 'loja' || user?.role === 'departamento') ? 'text-gray-300' : 'text-gray-600'}`}>
            {user?.role === 'admin' && 'Painel de Administração'}
            {user?.role === 'loja' && `Loja: ${user?.loja_name}`}
            {user?.role === 'departamento' && 'Departamento de Vidros Especiais'}
          </p>
        </div>
        
        {user?.role === 'loja' && (
          <Button 
            onClick={() => setModalNovoOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Pedido
          </Button>
        )}
      </div>

      {/* Dashboard da Loja e Departamento */}
      {(user?.role === 'loja' || user?.role === 'departamento') && pedidosStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(pedidosStats).map(([status, count]) => {
            const config = getStatusConfig(status);
            const isActive = filtroStatus === status;
            
            // Contar quantos pedidos deste status têm atualizações novas
            const comAtualizacoesNovas = pedidos.filter(p => 
              p.status === status && devePiscar(p)
            ).length;
            
            const shouldPulse = comAtualizacoesNovas > 0;
            
            return (
              <Card 
                key={status}
                className={`bg-gray-700 border-gray-600 cursor-pointer transition-all hover:scale-105 ${
                  shouldPulse ? 'animate-pulse' : ''
                } ${isActive ? `ring-2 ring-${config.color.replace('bg-', '')}` : ''}`}
                onClick={() => handleStatusClick(status)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-300">
                    {config.label}
                    {shouldPulse && comAtualizacoesNovas > 0 && (
                      <span className="ml-1 text-yellow-300">({comAtualizacoesNovas})</span>
                    )}
                  </CardTitle>
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

      {/* Campo de Pesquisa (para loja e departamento) */}
      {(user?.role === 'loja' || user?.role === 'departamento') && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={user?.role === 'departamento' 
                ? "Pesquisar por matrícula, marca, modelo, tipo de vidro ou loja..." 
                : "Pesquisar por matrícula, marca, modelo ou tipo de vidro..."}
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value.toUpperCase())}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 uppercase"
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

      {/* Painel Admin */}
      {user?.role === 'admin' && (
        <div className="text-center py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Painel de Administração</CardTitle>
              <CardDescription className="text-lg mt-2">
                Gerir lojas e utilizadores do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Utilize o menu de navegação para aceder às páginas de gestão:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card 
                  className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer hover:shadow-lg"
                  onClick={() => navigate('/admin/lojas')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Package className="mr-2 h-6 w-6 text-blue-600" />
                      Gestão de Lojas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Criar, editar e eliminar lojas do sistema
                    </p>
                  </CardContent>
                </Card>
                <Card 
                  className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer hover:shadow-lg"
                  onClick={() => navigate('/admin/users')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <TrendingUp className="mr-2 h-6 w-6 text-green-600" />
                      Gestão de Utilizadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Criar, editar, eliminar e repor passwords
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid de Pedidos em Cartões Quadrados */}
      {(user?.role === 'loja' || user?.role === 'departamento') && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {filtroStatus ? `${getStatusConfig(filtroStatus).label}` : 'Pedidos Ativos'}
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
                const shouldPulse = devePiscar(pedido);
                
                return (
                  <Card
                    key={pedido.id}
                    onClick={() => handlePedidoClick(pedido)}
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
                      {user?.role === 'departamento' && (
                        <p className="text-xs text-blue-300 font-semibold pt-1 border-t border-gray-600">
                          📍 {pedido.loja_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-600">
                        <span>{formatDate(pedido.created_at)}</span>
                        <div className="flex space-x-2">
                          {pedido.total_fotos > 0 && (
                            <span>📷 {pedido.total_fotos}</span>
                          )}
                          {pedido.total_updates > 0 && (
                            <span className={shouldPulse ? 'font-bold text-yellow-300 animate-pulse' : ''}>
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
        isOpen={modalNovoOpen}
        onClose={() => setModalNovoOpen(false)}
        onSuccess={loadData}
      />

      {/* Modal Detalhes do Pedido - Loja */}
      {user?.role === 'loja' && (
        <ModalDetalhesPedido
          pedidoId={pedidoSelecionado}
          isOpen={modalDetalhesOpen}
          onClose={handleCloseDetalhes}
          onUpdate={loadData}
        />
      )}

      {/* Modal Detalhes do Pedido - Departamento */}
      {user?.role === 'departamento' && (
        <ModalDetalhesPedidoDept
          pedidoId={pedidoSelecionado}
          isOpen={modalDetalhesOpen}
          onClose={handleCloseDetalhes}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

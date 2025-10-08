import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI, adminAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosStats, setPedidosStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar pedidos recentes
      const pedidosData = await pedidosAPI.getPedidos();
      setPedidos(pedidosData.slice(0, 5));

      // Calcular estatísticas de pedidos para lojas
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

      // Se for admin, carregar estatísticas
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

  const getStatusBadge = (status) => {
    const variants = {
      pendente: { variant: 'secondary', label: 'Pendente' },
      em_progresso: { variant: 'default', label: 'Em Progresso' },
      respondido: { variant: 'default', label: 'Respondido' },
      aguarda_resposta: { variant: 'default', label: 'Aguarda Resposta' },
      encontrado: { variant: 'default', label: 'Encontrado' },
      concluido: { variant: 'default', label: 'Concluído' },
      cancelado: { variant: 'destructive', label: 'Cancelado' }
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${user?.role === 'loja' ? 'min-h-screen bg-gray-800 -m-6 p-6' : ''}`}>
      {/* Header */}
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

      {/* Totalizadores para Loja */}
      {user?.role === 'loja' && pedidosStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{pedidosStats.pendente}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{pedidosStats.em_progresso}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600 animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Respondido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300 animate-pulse">{pedidosStats.respondido}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600 animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Aguarda Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300 animate-pulse">{pedidosStats.aguarda_resposta}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{pedidosStats.encontrado}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Concluído</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{pedidosStats.concluido}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Cancelado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{pedidosStats.cancelado}</div>
            </CardContent>
          </Card>
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

      {/* Pedidos Recentes */}
      <Card className={user?.role === 'loja' ? 'bg-gray-700 border-gray-600' : ''}>
        <CardHeader>
          <CardTitle className={user?.role === 'loja' ? 'text-white' : ''}>Pedidos Recentes</CardTitle>
          <CardDescription className={user?.role === 'loja' ? 'text-gray-300' : ''}>
            {pedidos.length === 0 ? 'Nenhum pedido encontrado' : `Últimos ${pedidos.length} pedidos`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <Package className={`mx-auto h-12 w-12 ${user?.role === 'loja' ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`mt-4 ${user?.role === 'loja' ? 'text-gray-300' : 'text-gray-600'}`}>Nenhum pedido registado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    user?.role === 'loja' 
                      ? 'border-gray-600 bg-gray-800 hover:bg-gray-750' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className={`font-semibold ${user?.role === 'loja' ? 'text-white' : 'text-gray-900'}`}>
                        {pedido.marca_carro} {pedido.modelo_carro}
                      </h3>
                      {getStatusBadge(pedido.status)}
                    </div>
                    <p className={`text-sm mt-1 ${user?.role === 'loja' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {pedido.tipo_vidro}
                      {user?.role !== 'loja' && ` • ${pedido.loja_name}`}
                    </p>
                    <p className={`text-xs mt-1 ${user?.role === 'loja' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(pedido.created_at)}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-4 text-sm ${user?.role === 'loja' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {pedido.total_fotos > 0 && (
                      <span>{pedido.total_fotos} foto(s)</span>
                    )}
                    {pedido.total_updates > 0 && (
                      <span>{pedido.total_updates} update(s)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.role === 'loja' && (
          <Card className="border-blue-500 bg-blue-900/30">
            <CardHeader>
              <CardTitle className="text-blue-200">Novo Pedido</CardTitle>
              <CardDescription className="text-blue-300">
                Criar um novo pedido de vidro especial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/pedidos/novo"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                Criar Pedido
              </a>
            </CardContent>
          </Card>
        )}

        {user?.role === 'departamento' && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-900">Pedidos Pendentes</CardTitle>
              <CardDescription className="text-green-700">
                Ver todos os pedidos aguardando processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/pedidos?status=pendente"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              >
                Ver Pedidos
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

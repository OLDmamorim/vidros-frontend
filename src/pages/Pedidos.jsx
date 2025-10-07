import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Package } from 'lucide-react';

export default function Pedidos() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'todos');

  useEffect(() => {
    loadPedidos();
  }, [statusFilter]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== 'todos') {
        filters.status = statusFilter;
      }
      const data = await pedidosAPI.getPedidos(filters);
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pendente: { variant: 'secondary', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      em_progresso: { variant: 'default', label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
      encontrado: { variant: 'default', label: 'Encontrado', color: 'bg-green-100 text-green-800' },
      concluido: { variant: 'default', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
      cancelado: { variant: 'destructive', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    const config = variants[status] || variants.pendente;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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

  const filteredPedidos = pedidos.filter(pedido => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      pedido.marca_carro.toLowerCase().includes(term) ||
      pedido.modelo_carro.toLowerCase().includes(term) ||
      pedido.tipo_vidro.toLowerCase().includes(term) ||
      pedido.loja_name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gestão de pedidos de vidros especiais
          </p>
        </div>
        {user?.role === 'loja' && (
          <Link to="/pedidos/novo">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por marca, modelo, tipo de vidro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_progresso">Em Progresso</SelectItem>
                <SelectItem value="encontrado">Encontrado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum pedido encontrado</h3>
              <p className="mt-2 text-gray-600">
                {searchTerm || statusFilter !== 'todos'
                  ? 'Tente ajustar os filtros de pesquisa'
                  : user?.role === 'loja'
                  ? 'Comece criando o seu primeiro pedido'
                  : 'Ainda não existem pedidos no sistema'}
              </p>
              {user?.role === 'loja' && !searchTerm && statusFilter === 'todos' && (
                <Link to="/pedidos/novo">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Pedido
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPedidos.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pedido.marca_carro} {pedido.modelo_carro}
                          {pedido.ano_carro && ` (${pedido.ano_carro})`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Tipo:</span> {pedido.tipo_vidro}
                        </p>
                      </div>
                      {getStatusBadge(pedido.status)}
                    </div>
                    
                    {user?.role !== 'loja' && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Loja:</span> {pedido.loja_name}
                      </p>
                    )}
                    
                    {pedido.descricao && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {pedido.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Criado: {formatDate(pedido.created_at)}</span>
                      {pedido.total_fotos > 0 && (
                        <span>• {pedido.total_fotos} foto(s)</span>
                      )}
                      {pedido.total_updates > 0 && (
                        <span>• {pedido.total_updates} atualização(ões)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link to={`/pedidos/${pedido.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contador */}
      {filteredPedidos.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          A mostrar {filteredPedidos.length} de {pedidos.length} pedido(s)
        </div>
      )}
    </div>
  );
}

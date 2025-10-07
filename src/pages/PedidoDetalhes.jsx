import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, User, Package, Image as ImageIcon, MessageSquare, Plus, Loader2, XCircle } from 'lucide-react';

export default function PedidoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [updateForm, setUpdateForm] = useState({
    tipo: 'geral',
    conteudo: '',
    preco: '',
    prazo_dias: '',
    visivel_loja: false
  });

  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadPedido();
  }, [id]);

  const loadPedido = async () => {
    try {
      setLoading(true);
      const data = await pedidosAPI.getPedido(id);
      setPedido(data);
      setNewStatus(data.status);
    } catch (err) {
      setError(err.message || 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateForm.conteudo.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const updateData = {
        tipo: updateForm.tipo,
        conteudo: updateForm.conteudo,
        visivel_loja: updateForm.visivel_loja
      };

      if (updateForm.preco) {
        updateData.preco = parseFloat(updateForm.preco);
      }

      if (updateForm.prazo_dias) {
        updateData.prazo_dias = parseInt(updateForm.prazo_dias);
      }

      await pedidosAPI.addUpdate(id, updateData);
      
      // Resetar formulário
      setUpdateForm({
        tipo: 'geral',
        conteudo: '',
        preco: '',
        prazo_dias: '',
        visivel_loja: false
      });
      
      setUpdateDialogOpen(false);
      await loadPedido();
    } catch (err) {
      setError(err.message || 'Erro ao adicionar atualização');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSubmitting(true);
      setError('');
      await pedidosAPI.updatePedido(id, { status: newStatus });
      setStatusDialogOpen(false);
      await loadPedido();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPedido = async () => {
    try {
      setSubmitting(true);
      setError('');
      await pedidosAPI.cancelPedido(id);
      setCancelDialogOpen(false);
      navigate('/pedidos');
    } catch (err) {
      setError(err.message || 'Erro ao cancelar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pendente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      em_progresso: { color: 'bg-blue-100 text-blue-800', label: 'Em Progresso' },
      encontrado: { color: 'bg-green-100 text-green-800', label: 'Encontrado' },
      concluido: { color: 'bg-gray-100 text-gray-800', label: 'Concluído' },
      cancelado: { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };
    const config = variants[status] || variants.pendente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !pedido) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/pedidos')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pedidos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {pedido.marca_carro} {pedido.modelo_carro}
            </h1>
            <p className="text-gray-600 mt-1">
              Pedido #{pedido.id} • {formatDate(pedido.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(pedido.status)}
          {user?.role === 'departamento' && pedido.status !== 'cancelado' && (
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Alterar Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Status do Pedido</DialogTitle>
                  <DialogDescription>
                    Selecione o novo status para este pedido
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_progresso">Em Progresso</SelectItem>
                      <SelectItem value="encontrado">Encontrado</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateStatus} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Marca e Modelo</p>
              <p className="font-semibold">{pedido.marca_carro} {pedido.modelo_carro}</p>
            </div>
            {pedido.ano_carro && (
              <div>
                <p className="text-sm text-gray-600">Ano</p>
                <p className="font-semibold">{pedido.ano_carro}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Tipo de Vidro</p>
              <p className="font-semibold">{pedido.tipo_vidro}</p>
            </div>
            {pedido.descricao && (
              <div>
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="text-sm">{pedido.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role !== 'loja' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Loja</p>
                  <p className="font-semibold">{pedido.loja_name}</p>
                </div>
                {pedido.loja_email && (
                  <div>
                    <p className="text-sm text-gray-600">Email da Loja</p>
                    <p className="text-sm">{pedido.loja_email}</p>
                  </div>
                )}
                {pedido.loja_phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone da Loja</p>
                    <p className="text-sm">{pedido.loja_phone}</p>
                  </div>
                )}
              </>
            )}
            <div>
              <p className="text-sm text-gray-600">Criado por</p>
              <p className="font-semibold">{pedido.user_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Criação</p>
              <p className="text-sm">{formatDate(pedido.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Fotos e Atualizações */}
      <Tabs defaultValue="fotos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fotos">
            <ImageIcon className="mr-2 h-4 w-4" />
            Fotos ({pedido.fotos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="updates">
            <MessageSquare className="mr-2 h-4 w-4" />
            Atualizações ({pedido.updates?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fotos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Pedido</CardTitle>
              <CardDescription>
                Imagens fornecidas para identificação do vidro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pedido.fotos && pedido.fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pedido.fotos.map((foto, index) => (
                    <a
                      key={foto.id}
                      href={foto.foto_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square"
                    >
                      <img
                        src={foto.foto_url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600">Nenhuma foto adicionada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Atualizações do Pedido</CardTitle>
                <CardDescription>
                  Histórico de comunicação e progresso
                </CardDescription>
              </div>
              {user?.role === 'departamento' && pedido.status !== 'cancelado' && (
                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nova Atualização</DialogTitle>
                      <DialogDescription>
                        Adicione informações sobre o progresso do pedido
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tipo de Atualização</Label>
                        <Select
                          value={updateForm.tipo}
                          onValueChange={(value) => setUpdateForm(prev => ({ ...prev, tipo: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geral">Geral</SelectItem>
                            <SelectItem value="nota">Nota Interna</SelectItem>
                            <SelectItem value="contacto">Contacto Realizado</SelectItem>
                            <SelectItem value="preco">Informação de Preço</SelectItem>
                            <SelectItem value="estado">Estado do Produto</SelectItem>
                            <SelectItem value="prazo">Prazo de Entrega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Conteúdo *</Label>
                        <Textarea
                          value={updateForm.conteudo}
                          onChange={(e) => setUpdateForm(prev => ({ ...prev, conteudo: e.target.value }))}
                          placeholder="Descreva a atualização..."
                          rows={4}
                        />
                      </div>

                      {updateForm.tipo === 'preco' && (
                        <div className="space-y-2">
                          <Label>Preço (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={updateForm.preco}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, preco: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      {updateForm.tipo === 'prazo' && (
                        <div className="space-y-2">
                          <Label>Prazo (dias)</Label>
                          <Input
                            type="number"
                            value={updateForm.prazo_dias}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, prazo_dias: e.target.value }))}
                            placeholder="Ex: 7"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="visivel_loja"
                          checked={updateForm.visivel_loja}
                          onChange={(e) => setUpdateForm(prev => ({ ...prev, visivel_loja: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="visivel_loja" className="cursor-pointer">
                          Visível para a loja
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddUpdate} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {pedido.updates && pedido.updates.length > 0 ? (
                <div className="space-y-4">
                  {pedido.updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">{update.user_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {update.tipo}
                            </Badge>
                            {!update.visivel_loja && user?.role !== 'loja' && (
                              <Badge variant="secondary" className="text-xs">
                                Interno
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{update.conteudo}</p>
                          {update.preco && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              Preço: €{parseFloat(update.preco).toFixed(2)}
                            </p>
                          )}
                          {update.prazo_dias && (
                            <p className="text-sm font-semibold text-blue-600 mt-1">
                              Prazo: {update.prazo_dias} dias
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600">Nenhuma atualização registada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      {pedido.status !== 'cancelado' && pedido.status !== 'concluido' && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-900">Zona de Perigo</CardTitle>
            <CardDescription className="text-red-700">
              Ações irreversíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Pedido
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Pedido</DialogTitle>
                  <DialogDescription>
                    Tem a certeza que deseja cancelar este pedido? Esta ação não pode ser revertida.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    Não, manter pedido
                  </Button>
                  <Button variant="destructive" onClick={handleCancelPedido} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sim, cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

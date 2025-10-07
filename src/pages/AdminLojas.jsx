import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Store } from 'lucide-react';

export default function AdminLojas() {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);
  const [deletingLoja, setDeletingLoja] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadLojas();
  }, []);

  const loadLojas = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getLojas();
      setLojas(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (loja = null) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        name: loja.name,
        address: loja.address || '',
        phone: loja.phone || '',
        email: loja.email || ''
      });
    } else {
      setEditingLoja(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: ''
      });
    }
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingLoja) {
        await adminAPI.updateLoja(editingLoja.id, formData);
      } else {
        await adminAPI.createLoja(formData);
      }
      setDialogOpen(false);
      await loadLojas();
    } catch (err) {
      setError(err.message || 'Erro ao guardar loja');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLoja) return;

    setError('');
    setSubmitting(true);

    try {
      await adminAPI.deleteLoja(deletingLoja.id);
      setDeleteDialogOpen(false);
      setDeletingLoja(null);
      await loadLojas();
    } catch (err) {
      setError(err.message || 'Erro ao eliminar loja');
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Lojas</h1>
          <p className="text-gray-600 mt-1">
            Administração de lojas do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingLoja ? 'Editar Loja' : 'Nova Loja'}
                </DialogTitle>
                <DialogDescription>
                  {editingLoja ? 'Atualize os dados da loja' : 'Preencha os dados da nova loja'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={submitting}
                    placeholder="Ex: Loja Centro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={submitting}
                    placeholder="Ex: Rua Principal, 123, Lisboa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={submitting}
                      placeholder="Ex: 210000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={submitting}
                      placeholder="Ex: loja@exemplo.pt"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Lojas */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas Registadas</CardTitle>
          <CardDescription>
            {lojas.length} loja(s) no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lojas.length === 0 ? (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhuma loja registada</h3>
              <p className="mt-2 text-gray-600">Comece criando a primeira loja</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Loja
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Morada</TableHead>
                    <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lojas.map((loja) => (
                    <TableRow key={loja.id}>
                      <TableCell className="font-medium">{loja.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {loja.address || '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm">
                          {loja.phone && <div>{loja.phone}</div>}
                          {loja.email && <div className="text-gray-600">{loja.email}</div>}
                          {!loja.phone && !loja.email && '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loja.active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(loja)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingLoja(loja);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Eliminação */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Loja</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar a loja <strong>{deletingLoja?.name}</strong>?
              Esta ação não pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingLoja(null);
                setError('');
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A eliminar...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

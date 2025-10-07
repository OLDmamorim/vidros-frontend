import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'loja',
    loja_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, lojasData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getLojas()
      ]);
      setUsers(usersData);
      setLojas(lojasData.filter(l => l.active));
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        loja_id: user.loja_id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'loja',
        loja_id: ''
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
      const submitData = { ...formData };
      
      // Se role não é loja, remover loja_id
      if (submitData.role !== 'loja') {
        submitData.loja_id = null;
      }

      // Se estiver editando e password estiver vazia, não enviar
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, submitData);
      } else {
        if (!submitData.password) {
          setError('Password é obrigatória para novos utilizadores');
          setSubmitting(false);
          return;
        }
        await adminAPI.createUser(submitData);
      }
      
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao guardar utilizador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setError('');
    setSubmitting(true);

    try {
      await adminAPI.deleteUser(deletingUser.id);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao eliminar utilizador');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      loja: { color: 'bg-blue-100 text-blue-800', label: 'Loja' },
      departamento: { color: 'bg-green-100 text-green-800', label: 'Departamento' }
    };
    const config = variants[role] || variants.loja;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Utilizadores</h1>
          <p className="text-gray-600 mt-1">
            Administração de utilizadores do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Atualize os dados do utilizador' : 'Preencha os dados do novo utilizador'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={submitting}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={submitting}
                    placeholder="Ex: joao@exemplo.pt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser && '(deixe vazio para manter)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    disabled={submitting}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Utilizador *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value, loja_id: value !== 'loja' ? '' : prev.loja_id }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="loja">Loja</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'loja' && (
                  <div className="space-y-2">
                    <Label htmlFor="loja_id">Loja *</Label>
                    <Select
                      value={formData.loja_id.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, loja_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {lojas.map(loja => (
                          <SelectItem key={loja.id} value={loja.id.toString()}>
                            {loja.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lojas.length === 0 && (
                      <p className="text-sm text-red-600">
                        Nenhuma loja disponível. Crie uma loja primeiro.
                      </p>
                    )}
                  </div>
                )}
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
                <Button type="submit" disabled={submitting || (formData.role === 'loja' && !formData.loja_id)}>
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

      {/* Tabela de Utilizadores */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizadores Registados</CardTitle>
          <CardDescription>
            {users.length} utilizador(es) no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum utilizador registado</h3>
              <p className="mt-2 text-gray-600">Comece criando o primeiro utilizador</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Utilizador
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Loja</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.loja_name || '-'}
                      </TableCell>
                      <TableCell>
                        {user.active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingUser(user);
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
            <DialogTitle>Eliminar Utilizador</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar o utilizador <strong>{deletingUser?.name}</strong>?
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
                setDeletingUser(null);
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

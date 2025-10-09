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
import { Plus, Edit, Trash2, Loader2, Users, Key, Upload } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
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
        username: user.username,
        password: '',
        role: user.role,
        loja_id: user.loja_id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
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

  const handleResetPassword = async () => {
    if (!resettingUser || !newPassword) return;

    if (newPassword.length < 6) {
      setError('Password deve ter pelo menos 6 caracteres');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await adminAPI.resetPassword(resettingUser.id, newPassword);
      setResetPasswordDialogOpen(false);
      setResettingUser(null);
      setNewPassword('');
      alert('Password alterada com sucesso!');
    } catch (err) {
      setError(err.message || 'Erro ao repor password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      setError('Por favor selecione um ficheiro');
      return;
    }

    try {
      setImporting(true);
      setError('');

      // Carregar biblioteca XLSX se ainda não estiver carregada
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      // Ler ficheiro Excel
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = window.XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          // Processar linhas (pular header)
          const utilizadores = rows
            .slice(1) // Pular primeira linha (header)
            .filter(row => row[0] && row[1] && row[2] && row[3]) // Tem nome, username, password, tipo
            .map(row => ({
              name: row[0]?.toString().trim(),
              username: row[1]?.toString().trim(),
              password: row[2]?.toString().trim(),
              role: row[3]?.toString().trim().toLowerCase(),
              loja_name: row[4]?.toString().trim() || null
            }));

          if (utilizadores.length === 0) {
            setError('Nenhum utilizador válido encontrado no ficheiro');
            setImporting(false);
            return;
          }

          // Criar utilizadores
          let sucessos = 0;
          let erros = 0;

          for (const user of utilizadores) {
            try {
              // Encontrar loja pelo nome (se especificada)
              let loja_id = null;
              if (user.loja_name) {
                const loja = lojas.find(l => 
                  l.name.toLowerCase() === user.loja_name.toLowerCase()
                );
                if (loja) {
                  loja_id = loja.id;
                }
              }

              // Criar utilizador
              await adminAPI.createUser({
                name: user.name,
                username: user.username,
                password: user.password,
                role: user.role,
                loja_id: loja_id
              });

              sucessos++;
            } catch (err) {
              console.error(`Erro ao criar utilizador ${user.username}:`, err);
              erros++;
            }
          }

          // Recarregar lista
          await loadData();

          // Fechar modal e mostrar resultado
          setImportDialogOpen(false);
          setImportFile(null);

          if (erros === 0) {
            alert(`✅ ${sucessos} utilizador(es) importado(s) com sucesso!`);
          } else {
            alert(`⚠️ ${sucessos} utilizador(es) importado(s), ${erros} erro(s)`);
          }
        } catch (err) {
          console.error('Erro ao processar Excel:', err);
          setError('Erro ao processar ficheiro Excel: ' + err.message);
        } finally {
          setImporting(false);
        }
      };

      reader.readAsArrayBuffer(importFile);
    } catch (err) {
      console.error('Erro ao importar:', err);
      setError('Erro ao importar utilizadores: ' + err.message);
      setImporting(false);
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Importar Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Utilizadores via Excel</DialogTitle>
                <DialogDescription>
                  Selecione um ficheiro Excel (.xlsx ou .xls) com os dados dos utilizadores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="excel-file">Ficheiro Excel</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    disabled={importing}
                  />
                  <div className="text-xs text-gray-500 space-y-1 mt-2">
                    <p><strong>Formato esperado:</strong></p>
                    <p>• Coluna A: Nome</p>
                    <p>• Coluna B: Username</p>
                    <p>• Coluna C: Password</p>
                    <p>• Coluna D: Tipo (admin, loja, departamento)</p>
                    <p>• Coluna E: Loja (nome da loja, se aplicável)</p>
                    <p className="mt-2 italic">Primeira linha é ignorada como header</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImportDialogOpen(false);
                    setImportFile(null);
                    setError('');
                  }}
                  disabled={importing}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleImportExcel}
                  disabled={importing || !importFile}
                >
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {importing ? 'A importar...' : 'Importar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
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
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={submitting}
                    placeholder="Ex: joao.silva"
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
                    <TableHead>Username</TableHead>
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
                      <TableCell>{user.username}</TableCell>
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
                            title="Editar utilizador"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setResettingUser(user);
                              setNewPassword('');
                              setResetPasswordDialogOpen(true);
                            }}
                            title="Repor password"
                          >
                            <Key className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingUser(user);
                              setDeleteDialogOpen(true);
                            }}
                            title="Eliminar utilizador"
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

      {/* Dialog de Reset Password */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repor Password</DialogTitle>
            <DialogDescription>
              Definir nova password para o utilizador <strong>{resettingUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setResettingUser(null);
                setNewPassword('');
                setError('');
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={submitting || !newPassword}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A alterar...
                </>
              ) : (
                'Alterar Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

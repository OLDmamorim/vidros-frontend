import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidosAPI, uploadImage } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, X, Loader2, Camera } from 'lucide-react';

export default function NovoPedido() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fotos, setFotos] = useState([]);
  const [formData, setFormData] = useState({
    marca_carro: '',
    modelo_carro: '',
    ano_carro: '',
    tipo_vidro: '',
    descricao: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada foto deve ter no máximo 5MB');
        continue;
      }

      try {
        const base64 = await uploadImage(file);
        setFotos(prev => [...prev, { url: base64, name: file.name }]);
      } catch (err) {
        console.error('Erro ao processar foto:', err);
        setError('Erro ao processar foto');
      }
    }
  };

  const removeFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const pedidoData = {
        ...formData,
        ano_carro: formData.ano_carro ? parseInt(formData.ano_carro) : null,
        fotos: fotos.map(f => f.url)
      };

      await pedidosAPI.createPedido(pedidoData);
      navigate('/pedidos');
    } catch (err) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/pedidos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Pedido</h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do vidro que necessita
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
            <CardDescription>
              Forneça os dados do carro e do vidro necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca_carro">Marca *</Label>
                <Input
                  id="marca_carro"
                  name="marca_carro"
                  placeholder="Ex: Mercedes"
                  value={formData.marca_carro}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo_carro">Modelo *</Label>
                <Input
                  id="modelo_carro"
                  name="modelo_carro"
                  placeholder="Ex: Classe A"
                  value={formData.modelo_carro}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano_carro">Ano</Label>
                <Input
                  id="ano_carro"
                  name="ano_carro"
                  type="number"
                  placeholder="Ex: 2015"
                  value={formData.ano_carro}
                  onChange={handleInputChange}
                  disabled={loading}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_vidro">Tipo de Vidro *</Label>
                <Input
                  id="tipo_vidro"
                  name="tipo_vidro"
                  placeholder="Ex: Vidro porta frente esquerda"
                  value={formData.tipo_vidro}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição / Observações</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Adicione informações adicionais sobre o vidro necessário..."
                value={formData.descricao}
                onChange={handleInputChange}
                disabled={loading}
                rows={4}
              />
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-4">
              <div>
                <Label>Fotos</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Adicione fotos do veículo ou do vidro (máx. 5MB por foto)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={foto.url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">Adicionar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pedidos')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  'Criar Pedido'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

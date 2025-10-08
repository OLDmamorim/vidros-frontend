import { useState } from 'react';
import { pedidosAPI, uploadImage } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Camera, Loader2 } from 'lucide-react';

export default function ModalNovoPedido({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fotos, setFotos] = useState([]);
  const [tiposVidroSelecionados, setTiposVidroSelecionados] = useState([]);
  const [outroTipoVidro, setOutroTipoVidro] = useState('');
  const [formData, setFormData] = useState({
    matricula: '',
    marca_carro: '',
    modelo_carro: '',
    ano_carro: '',
    descricao: ''
  });

  const tiposVidroDisponiveis = [
    '1 - Pára-Brisas',
    '2 - Custódia Frente Direita',
    '3 - Triângulo Prt Dir. Frente',
    '4 - Lateral Direito Passageiro',
    '5 - Lateral Direito Traseiro',
    '6 - Triângulo Prt Dir. Traseira',
    '7 - Custódia Traseira Direita',
    '8 - Óculo Traseiro Direito',
    '9 - Óculo Traseiro',
    '10 - Óculo Traseiro Esquerdo',
    '11 - Custódia Traseira Esquerda',
    '12 - Triângulo Prt Esq. Traseira',
    '13 - Lateral Esquerdo Traseiro',
    '14 - Lateral Esquerdo Condutor',
    '15 - Triângulo Prt Esq. Frente',
    '16 - Custódia Frente Esquerda',
    '17 - Tecto'
  ];

  const formatMatricula = (value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'matricula') {
      processedValue = formatMatricula(value);
    }
    
    if (['marca_carro', 'modelo_carro', 'tipo_vidro'].includes(name)) {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
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

  const toggleTipoVidro = (tipo) => {
    setTiposVidroSelecionados(prev => 
      prev.includes(tipo) 
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que pelo menos um tipo foi selecionado
    const todosTipos = [...tiposVidroSelecionados];
    if (outroTipoVidro.trim()) {
      todosTipos.push(outroTipoVidro.trim().toUpperCase());
    }

    if (todosTipos.length === 0) {
      setError('Selecione pelo menos um tipo de vidro');
      return;
    }

    setLoading(true);

    try {
      const pedidoData = {
        ...formData,
        ano_carro: formData.ano_carro ? parseInt(formData.ano_carro) : null,
        tipo_vidro: todosTipos.join(', '),
        fotos: fotos.map(f => f.url)
      };

      await pedidosAPI.createPedido(pedidoData);
      
      // Reset form
      setFormData({
        matricula: '',
        marca_carro: '',
        modelo_carro: '',
        ano_carro: '',
        descricao: ''
      });
      setFotos([]);
      setTiposVidroSelecionados([]);
      setOutroTipoVidro('');
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Novo Pedido</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Matrícula */}
          <div className="space-y-2">
            <Label htmlFor="matricula" className="text-gray-300">Matrícula *</Label>
            <Input
              id="matricula"
              name="matricula"
              placeholder="XX-XX-XX"
              value={formData.matricula}
              onChange={handleInputChange}
              required
              disabled={loading}
              maxLength={8}
              className="font-mono text-lg bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca_carro" className="text-gray-300">Marca *</Label>
              <Input
                id="marca_carro"
                name="marca_carro"
                placeholder="Ex: MERCEDES"
                value={formData.marca_carro}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="uppercase bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo_carro" className="text-gray-300">Modelo *</Label>
              <Input
                id="modelo_carro"
                name="modelo_carro"
                placeholder="Ex: CLASSE A"
                value={formData.modelo_carro}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="uppercase bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano_carro" className="text-gray-300">Ano</Label>
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
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Imagem de Referência dos Tipos de Vidro */}
          <div className="space-y-2">
            <Label className="text-gray-300">Referência de Identificação de Vidros</Label>
            <div className="bg-gray-700 border border-gray-600 rounded-md p-3">
              <img 
                src="/glass-reference-pt.jpg" 
                alt="Referência de tipos de vidros de automóvel" 
                className="w-full h-auto rounded"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Use esta imagem como referência para identificar os tipos de vidro
              </p>
            </div>
          </div>

          {/* Seleção de Tipos de Vidro */}
          <div className="space-y-2">
            <Label className="text-gray-300">Tipo de Vidro * (selecione um ou mais)</Label>
            <div className="bg-gray-700 border border-gray-600 rounded-md p-3 max-h-64 overflow-y-auto space-y-2">
              {tiposVidroDisponiveis.map((tipo) => (
                <label key={tipo} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={tiposVidroSelecionados.includes(tipo)}
                    onChange={() => toggleTipoVidro(tipo)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-500 rounded focus:ring-blue-500"
                  />
                  <span className="text-white text-sm">{tipo}</span>
                </label>
              ))}
              <div className="pt-2 border-t border-gray-600">
                <Input
                  placeholder="Outro (especifique)"
                  value={outroTipoVidro}
                  onChange={(e) => setOutroTipoVidro(e.target.value)}
                  disabled={loading}
                  className="uppercase bg-gray-800 border-gray-500 text-white text-sm"
                />
              </div>
            </div>
            {tiposVidroSelecionados.length > 0 && (
              <div className="text-sm text-gray-400 mt-1">
                {tiposVidroSelecionados.length} tipo(s) selecionado(s)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-gray-300">Descrição / Observações</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Adicione informações adicionais sobre o vidro necessário..."
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Upload de Fotos */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Fotos</Label>
              <p className="text-sm text-gray-400 mt-1">
                Adicione fotos do veículo ou do vidro (máx. 5MB por foto)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fotos.map((foto, index) => (
                <div key={index} className="relative group">
                  <img
                    src={foto.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
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

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-colors">
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-400">Adicionar Foto</span>
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
              onClick={onClose}
              disabled={loading}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
        </form>
      </div>
    </div>
  );
}

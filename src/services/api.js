// Configuração da URL da API
const API_URL = import.meta.env.VITE_API_URL || 'https://vidros-backend-production.up.railway.app';

console.log('API_URL configurado:', API_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ===== ADMIN =====

export const adminAPI = {
  // Lojas
  getLojas: async () => {
    const response = await fetch(`${API_URL}/api/admin/lojas`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter lojas');
    return response.json();
  },

  createLoja: async (data) => {
    const response = await fetch(`${API_URL}/api/admin/lojas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar loja');
    return response.json();
  },

  updateLoja: async (id, data) => {
    const response = await fetch(`${API_URL}/api/admin/lojas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar loja');
    return response.json();
  },

  deleteLoja: async (id) => {
    const response = await fetch(`${API_URL}/api/admin/lojas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar loja');
    }
    return response.json();
  },

  // Utilizadores
  getUsers: async () => {
    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter utilizadores');
    return response.json();
  },

  createUser: async (data) => {
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar utilizador');
    }
    return response.json();
  },

  updateUser: async (id, data) => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar utilizador');
    }
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar utilizador');
    }
    return response.json();
  },

  resetPassword: async (id, new_password) => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ new_password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao repor password');
    }
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/api/admin/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter estatísticas');
    return response.json();
  }
};

// ===== PEDIDOS =====

export const pedidosAPI = {
  getPedidos: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/pedidos?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter pedidos');
    return response.json();
  },

  getPedido: async (id) => {
    const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter pedido');
    return response.json();
  },

  createPedido: async (data) => {
    const response = await fetch(`${API_URL}/api/pedidos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar pedido');
    return response.json();
  },

  updatePedido: async (id, data) => {
    const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar pedido');
    return response.json();
  },

  cancelPedido: async (id) => {
    const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao cancelar pedido');
    return response.json();
  },

  addFoto: async (pedidoId, foto_url) => {
    const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}/fotos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ foto_url })
    });
    if (!response.ok) throw new Error('Erro ao adicionar foto');
    return response.json();
  },

  addUpdate: async (pedidoId, data) => {
    const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}/updates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao adicionar update');
    }
    return response.json();
  },

  getUpdates: async (pedidoId) => {
    const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}/updates`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Erro ao obter updates');
    return response.json();
  }
};

// Função auxiliar para upload de imagens (base64)
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

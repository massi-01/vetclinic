const API_BASE = '/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('vet_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Se non autorizzato o token scaduto, pulisci token e reindirizza se opportuno
      localStorage.removeItem('vet_token');
      localStorage.removeItem('vet_user');
    }
    throw new Error(data.message || 'Errore nella richiesta di rete');
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/auth/me')
  },
  clinics: {
    getAll: () => request('/clinics'),
    getById: (id) => request(`/clinics/${id}`),
    create: (data) => request('/clinics', { method: 'POST', body: data }),
    update: (id, data) => request(`/clinics/${id}`, { method: 'PUT', body: data })
  },
  owners: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/owners${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/owners/${id}`),
    create: (data) => request('/owners', { method: 'POST', body: data }),
    update: (id, data) => request(`/owners/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/owners/${id}`, { method: 'DELETE' })
  },
  pets: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/pets${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/pets/${id}`),
    create: (data) => request('/pets', { method: 'POST', body: data }),
    update: (id, data) => request(`/pets/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/pets/${id}`, { method: 'DELETE' })
  },
  visits: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/visits${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/visits/${id}`),
    create: (data) => request('/visits', { method: 'POST', body: data }),
    update: (id, data) => request(`/visits/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/visits/${id}`, { method: 'DELETE' })
  },
  therapies: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/therapies${qs ? `?${qs}` : ''}`);
    },
    create: (data) => request('/therapies', { method: 'POST', body: data }),
    update: (id, data) => request(`/therapies/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/therapies/${id}`, { method: 'DELETE' })
  },
  stats: {
    getDashboard: (clinicId) => {
      const qs = clinicId ? `?clinicId=${clinicId}` : '';
      return request(`/stats/dashboard${qs}`);
    }
  }
};

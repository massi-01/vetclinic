const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';


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

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (networkErr) {
    const err = new Error(
      navigator.onLine === false
        ? 'Connessione a Internet assente. Verifica la tua rete.'
        : 'Server non raggiungibile. Verifica che il servizio sia attivo.'
    );
    err.status = 503;
    err.isNetworkError = true;
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      // Se non autorizzato o token scaduto su rotta protetta, pulisci token e notifica AuthContext
      localStorage.removeItem('vet_token');
      localStorage.removeItem('vet_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message: data.message } }));
    }
    const error = new Error(data.message || 'Errore nella richiesta di rete');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/auth/me'),
    updateProfile: (userData) => request('/auth/profile', { method: 'PUT', body: userData }),
    changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: passwords })
  },
  clinics: {
    getAll: () => request('/clinics'),
    getById: (id) => request(`/clinics/${id}`),
    create: (data) => request('/clinics', { method: 'POST', body: data }),
    update: (id, data) => request(`/clinics/${id}`, { method: 'PUT', body: data }),
    getAvailable: (search = '') => request(`/clinics/available${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    sendRequest: (data) => request('/clinics/requests', { method: 'POST', body: data }),
    getSentRequests: () => request('/clinics/requests/sent'),
    getReceivedRequests: () => request('/clinics/requests/received'),
    respondRequest: (id, data) => request(`/clinics/requests/${id}/respond`, { method: 'PUT', body: data })
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
  vaccinations: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/vaccinations${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/vaccinations/${id}`),
    create: (data) => request('/vaccinations', { method: 'POST', body: data }),
    update: (id, data) => request(`/vaccinations/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/vaccinations/${id}`, { method: 'DELETE' })
  },
  appointments: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/appointments${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/appointments/${id}`),
    create: (data) => request('/appointments', { method: 'POST', body: data }),
    update: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: data }),
    updateStatus: (id, stato) => request(`/appointments/${id}/status`, { method: 'PATCH', body: { stato } }),
    delete: (id) => request(`/appointments/${id}`, { method: 'DELETE' })
  },
  stats: {
    getDashboard: (clinicId) => {
      const qs = clinicId ? `?clinicId=${clinicId}` : '';
      return request(`/stats/dashboard${qs}`);
    }
  },
  auditLogs: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/audit-logs${qs ? `?${qs}` : ''}`);
    }
  }
};

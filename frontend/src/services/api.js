import axios from 'axios';

const API_BASE = 'http://localhost:5003/api/admin';

export const loginAdmin = (email, password) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const getDashboardSummary = (token) =>
  axios.get(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getPaginatedProducts = (token, page = 1, limit = 10) =>
  axios.get(
    `${API_BASE}/products/paginated?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const getProductById = (id, token) =>
  axios.get(`${API_BASE}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const addProduct = (token, data) =>
  axios.post(`${API_BASE}/products`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const editProduct = (token, id, data) =>
  axios.put(`${API_BASE}/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteProduct = (token, id) =>
  axios.delete(`${API_BASE}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getPaginatedOrders = (token, page = 1, limit = 10) =>
  axios.get(`${API_BASE}/orders/paginated?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });


export const getOrders = (token) =>
  axios.get(`${API_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getOrderDetail = (token, id) => {
  return axios.get(`${API_BASE}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateOrderStatus = (token, id, status, changedBy = 'Admin') => {
  return axios.patch(`${API_BASE}/orders/${id}/status`,
    { status, changed_by: changedBy },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};



export const uploadFile = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_BASE}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};


// Get all customers (unpaginated)
export const getAllCustomers = (token) =>
  axios.get(`${API_BASE}/customers`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get paginated customers
export const getPaginatedCustomers = (token, page = 1, limit = 10) =>
  axios.get(`${API_BASE}/customers/paginated?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get single customer (with details and orders)
export const getCustomerDetail = (token, id) =>
  axios.get(`${API_BASE}/customers/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Create new customer
export const addCustomer = (token, data) =>
  axios.post(`${API_BASE}/customers`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Update existing customer
// export const editCustomer = (token, id, data) =>
//   axios.put(`${API_BASE}/customers/${id}`, data, {
//     headers: { Authorization: `Bearer ${token}` }
//   });

// Delete customer
// export const deleteCustomer = (token, id) =>
//   axios.delete(`${API_BASE}/customers/${id}`, {
//     headers: { Authorization: `Bearer ${token}` }
//   });



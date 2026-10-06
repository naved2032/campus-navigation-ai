const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

function getHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  return headers;
}

export async function fetchLocations(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') {
    query.append('category', params.category);
  }
  if (params.search) {
    query.append('search', params.search);
  }
  if (params.floor) {
    query.append('floor', params.floor);
  }

  const url = `${API_BASE_URL}/locations${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchLocationById(id) {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch location #${id}`);
  }
  return response.json();
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/locations/categories`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function calculateRoute(startId, endId) {
  const response = await fetch(`${API_BASE_URL}/route`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ startId, endId })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to compute shortest route');
  }
  return data;
}

export async function fetchAllEdges() {
  const response = await fetch(`${API_BASE_URL}/route/edges`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch route network edges');
  }
  return response.json();
}

export async function createLocation(locationData) {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(locationData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create campus location');
  }
  return data;
}

export async function deleteLocation(id) {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete location');
  }
  return data;
}

export async function resetDatabaseSeed() {
  const response = await fetch(`${API_BASE_URL}/route/reset-seed`, {
    method: 'POST',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset seed');
  }
  return data;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      headers: getHeaders()
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

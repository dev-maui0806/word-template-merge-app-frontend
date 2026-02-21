const BASE = '/api';

export async function api(url, options = {}) {
  const at = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(at && { Authorization: `Bearer ${at}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    const rt = localStorage.getItem('refreshToken');
    if (rt) {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return api(url, { ...options, headers: { ...headers, Authorization: `Bearer ${data.accessToken}` } });
      }
    }
  }

  return res;
}

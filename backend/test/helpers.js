const BASE = process.env.API_BASE || 'http://localhost:3000';
let tokenPromise;

function stamp() {
  return `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

async function getToken() {
  if (!tokenPromise) {
    tokenPromise = fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@escola.com', senha: '123456' }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error('Não foi possível autenticar a suíte de testes.');
      return data.token;
    });
  }
  return tokenPromise;
}

async function request(method, path, body, authOptions = {}) {
  const requestOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (authOptions.auth !== false && !path.endsWith('/login')) {
    requestOptions.headers.Authorization = `Bearer ${authOptions.token || await getToken()}`;
  }
  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE}${path}`, requestOptions);
  } catch (error) {
    const err = new Error(`Falha de rede ao chamar ${method} ${path}: ${error.message}`);
    err.network = true;
    throw err;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { status: response.status, data, ok: response.ok, url: `${method} ${path}` };
}

export { BASE, request, stamp };

const base = '/api/v1/pokemon'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const listPokemon = () => fetch(`${base}/index`).then(handle)

export const getPokemon = (id) => fetch(`${base}/${id}`).then(handle)

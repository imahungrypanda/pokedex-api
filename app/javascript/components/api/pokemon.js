const base = '/api/v1/pokemon'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Normalize the index response into { data, meta } regardless of what
// shape the backend currently returns. The expected contract is:
//
//   { data: [...], meta: { page, per_page, total, total_pages } }
//
// Today the backend returns a flat array and ignores pagination params.
// We wrap that into the envelope shape so callers don't care about the
// transition. Once server-side pagination ships matching the contract,
// this normalize step becomes a passthrough.
function normalizeList(body, requestedPage, requestedPerPage) {
  if (Array.isArray(body)) {
    // Backend hasn't implemented pagination yet. Slice client-side so the
    // UI still feels paginated, and report the real total so the page
    // navigator knows how many pages to expose.
    const sorted = [...body].sort((a, b) => a.pokemon_id - b.pokemon_id)
    const start = (requestedPage - 1) * requestedPerPage
    return {
      data: sorted.slice(start, start + requestedPerPage),
      meta: {
        page: requestedPage,
        per_page: requestedPerPage,
        total: body.length,
        total_pages: Math.ceil(body.length / requestedPerPage),
        server_paginated: false,
      },
    }
  }
  return {
    data: body.data || [],
    meta: { ...body.meta, server_paginated: true },
  }
}

export const listPokemon = ({ page = 1, perPage = 24 } = {}) => {
  const url = `${base}/index?page_number=${page}&per_page=${perPage}`
  return fetch(url)
    .then(handle)
    .then((body) => normalizeList(body, page, perPage))
}

export const getPokemon = (id) => fetch(`${base}/${id}`).then(handle)

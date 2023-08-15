import React from 'react'

const PAGE_SIZE = 50

export default () => {
  const [pokemon, setPokemon] = React.useState([])
  const [offset, setOffset] = React.useState(0)

  const loadPokemon = () => {
    const url = `api/v1/pokemon/index?limit=${PAGE_SIZE}&offset=${offset}`
    fetch(url)
      .then((data) => {
        if (data.ok) {
          return data.json()
        }
        throw new Error('Network error.')
      })
      .then((data) => {
        console.log(data)
        const newPokemon = []

        data.forEach((pokemon) => {
          newPokemon.push({
            id: pokemon.id,
            name: pokemon.name
          })
        })

        setOffset(offset + PAGE_SIZE)

        if (pokemon.length === 0) {
          setPokemon(newPokemon)
        } else {
          setPokemon([...newPokemon, ...pokemon])
        }
      })
      .catch((err) => console.error('Error: ' + err.message))
  }

  return (
    <div>
      <div>Hello</div>
      <button onClick={loadPokemon}>Load Pokemon</button>
      <ul>
        {pokemon.map((pokemon) => (
          <li key={pokemon.id}>{pokemon.id} - {pokemon.name}</li>
        ))}
      </ul>
    </div>
  )
}

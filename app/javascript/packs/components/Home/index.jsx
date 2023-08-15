import React from 'react'

export default () => {
  const [pokemon, setPokemon] = React.useState([])
  const [pageNumber, setPageNumber] = React.useState(0)

  const loadPokemon = () => {
    const url = `api/v1/pokemon/index?page_number=${pageNumber}`
    fetch(url)
      .then((data) => {
        if (data.ok) {
          return data.json()
        }
        throw new Error('Network error.')
      })
      .then((data) => {
        const newPokemon = []

        data.forEach((pokemon) => {
          newPokemon.push({
            id: pokemon.id,
            name: pokemon.name
          })
        })

        setPageNumber(pageNumber + 1)
        setPokemon([...pokemon, ...newPokemon])
      })
      .catch((err) => console.error('Error: ' + err.message))
  }

  return (
    <div>
      <div>PokeDex</div>
      <button onClick={loadPokemon}>Load Pokemon</button>
      <ul>
        {pokemon.map((pokemon) => (
          <li key={pokemon.id}>{pokemon.id} - {pokemon.name}</li>
        ))}
      </ul>
    </div>
  )
}

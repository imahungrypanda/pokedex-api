import React from 'react'
import CreateForm from './CreateForm'

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
            name: pokemon.name,
          })
        })

        setPageNumber(pageNumber + 1)
        setPokemon([...pokemon, ...newPokemon])
      })
      .catch((err) => console.error('Error: ' + err.message))
  }

  return (
    <div>
      <h1>PokeDex</h1>
      <CreateForm />
      <button onClick={loadPokemon}>Next Page</button>
      <ul
        style={{
          maxHeight: '500px',
          overflow: 'scroll',
        }}>
        {pokemon.map((pokemon) => (
          <li key={pokemon.id}>
            {pokemon.id} - {pokemon.name}
          </li>
        ))}
        {pokemon.length === 0 && <li>No Pokemon found.</li>}
      </ul>
    </div>
  )
}

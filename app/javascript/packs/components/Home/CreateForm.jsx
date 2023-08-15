import React from 'react'

export default () => {
  const [name, setName] = React.useState('')
  const [id, setId] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState('')

  const submit = async (e) => {
    e.preventDefault()
    const data = {
      name,
      id,
      imageUrl,
    }

    console.log(data)
    const response = await fetch('api/v1/pokemon/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  console.log(name, id)

  return (
    <div>
      <div>Add Pokemon Form</div>
      <input
        type='text'
        placeholder='ID'
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type='text'
        placeholder='Name'
        onChange={(e) => setName(e.target.value)}
      />
      {/* <input
        type='text'
        placeholder='Image Url'
        onChange={(e) => setImageUrl(e.target.value)}
      /> */}
      <button onClick={submit}>Add Pokemon</button>
    </div>
  )
}
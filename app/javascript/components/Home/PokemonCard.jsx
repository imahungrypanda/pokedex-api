import React from 'react'
import { Card } from 'antd'
import TypeTag from '../TypeTag'

const { Meta } = Card

function formatId(id) {
  return `#${String(id).padStart(3, '0')}`
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : ''
}

export default function PokemonCard({ pokemon, onSelect }) {
  const { pokemon_id, name, image_url, pokemon_type, secondary_type } = pokemon

  return (
    <Card
      hoverable
      onClick={onSelect}
      cover={
        <div style={{ background: '#fafafa', padding: 12, textAlign: 'center' }}>
          <img
            src={image_url}
            alt={name}
            loading="lazy"
            style={{ width: '100%', maxWidth: 180, height: 180, objectFit: 'contain' }}
          />
        </div>
      }
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span>{capitalize(name)}</span>
            <span style={{ color: '#999', fontSize: 12 }}>{formatId(pokemon_id)}</span>
          </div>
        }
        description={
          <div>
            <TypeTag type={pokemon_type} />
            <TypeTag type={secondary_type} />
          </div>
        }
      />
    </Card>
  )
}

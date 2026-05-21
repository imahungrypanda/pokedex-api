import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Row, Col, Card, Skeleton, Result, Typography, Descriptions, Button, Image } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getPokemon } from '../api/pokemon'
import TypeTag from '../TypeTag'
import StatsBar from './StatsBar'

const { Title, Paragraph } = Typography

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : ''
}

function formatId(id) {
  return `#${String(id).padStart(3, '0')}`
}

function formatDimension(value, divisor, unit) {
  if (value == null) return '—'
  return `${(value / divisor).toFixed(1)} ${unit}`
}

export default function Detail() {
  const { pokemonId } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getPokemon(pokemonId)
      .then((row) => { setPokemon(row); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [pokemonId])

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (notFound || !pokemon) {
    return (
      <Result
        status="404"
        title="Pokémon not found"
        extra={<Link to="/"><Button type="primary">Back to PokéDex</Button></Link>}
      />
    )
  }

  return (
    <>
      <Link to="/">
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          Back
        </Button>
      </Link>

      <Card>
        <Row gutter={[32, 24]}>
          <Col xs={24} md={10}>
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 24, textAlign: 'center' }}>
              <Image
                src={pokemon.image_url}
                alt={`${pokemon.name} sprite`}
                preview={false}
                style={{ width: '100%', maxWidth: 360, height: 'auto' }}
                fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif'>No image</text></svg>"
              />
            </div>
          </Col>
          <Col xs={24} md={14}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Title level={1} style={{ margin: 0, textTransform: 'capitalize' }}>
                {capitalize(pokemon.name)}
              </Title>
              <span style={{ color: '#999', fontSize: 16 }}>{formatId(pokemon.pokemon_id)}</span>
            </div>
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <TypeTag type={pokemon.pokemon_type} />
              <TypeTag type={pokemon.secondary_type} />
            </div>

            {pokemon.description && (
              <Paragraph type="secondary" italic>"{pokemon.description}"</Paragraph>
            )}

            <Descriptions size="small" column={2} style={{ marginTop: 16, marginBottom: 24 }}>
              <Descriptions.Item label="Height">
                {formatDimension(pokemon.height_dm, 10, 'm')}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {formatDimension(pokemon.weight_hg, 10, 'kg')}
              </Descriptions.Item>
              <Descriptions.Item label="Generation">
                {pokemon.generation ?? '—'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4}>Base Stats</Title>
            <StatsBar stats={pokemon.base_stats} />
          </Col>
        </Row>
      </Card>
    </>
  )
}

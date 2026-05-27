import React, { useEffect, useState, useMemo } from 'react'
import { Row, Col, Pagination, Empty, Alert, Modal } from 'antd'
import { listPokemon } from '../api/pokemon'
import PokemonCard from './PokemonCard'
import CardSkeleton from './CardSkeleton'
import PokemonDetail from '../Detail/PokemonDetail'

const PAGE_SIZE = 24

export default function Home() {
  const [pokemon, setPokemon]   = useState([])
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    listPokemon()
      .then((rows) => {
        setPokemon(rows.sort((a, b) => a.pokemon_id - b.pokemon_id))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return pokemon.slice(start, start + PAGE_SIZE)
  }, [pokemon, page])

  if (error) {
    return <Alert type="error" message="Could not load Pokémon" description={error} showIcon />
  }

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={6} xl={4}>
            <CardSkeleton />
          </Col>
        ))}
      </Row>
    )
  }

  if (pokemon.length === 0) {
    return <Empty description="No Pokémon found." />
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {pageRows.map((p) => (
          <Col key={p.pokemon_id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <PokemonCard pokemon={p} onSelect={() => setSelected(p)} />
          </Col>
        ))}
      </Row>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={pokemon.length}
          showSizeChanger={false}
          onChange={(p) => {
            setPage(p)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      </div>
      <Modal
        open={selected !== null}
        onCancel={() => setSelected(null)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <PokemonDetail pokemon={selected} />
      </Modal>
    </>
  )
}

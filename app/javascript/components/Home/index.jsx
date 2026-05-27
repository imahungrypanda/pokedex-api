import React, { useEffect, useState } from 'react'
import { Row, Col, Pagination, Empty, Alert, Modal } from 'antd'
import { listPokemon } from '../api/pokemon'
import PokemonCard from './PokemonCard'
import CardSkeleton from './CardSkeleton'
import PokemonDetail from '../Detail/PokemonDetail'

const PAGE_SIZE = 24

export default function Home() {
  const [data, setData]         = useState([])
  const [meta, setMeta]         = useState({ page: 1, per_page: PAGE_SIZE, total: 0, total_pages: 0 })
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    listPokemon({ page, perPage: PAGE_SIZE })
      .then((result) => {
        setData(result.data)
        setMeta(result.meta)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  if (error) {
    return <Alert type="error" message="Could not load Pokémon" description={error} showIcon />
  }

  if (loading && data.length === 0) {
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

  if (data.length === 0) {
    return <Empty description="No Pokémon found." />
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {data.map((p) => (
          <Col key={p.pokemon_id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <PokemonCard pokemon={p} onSelect={() => setSelected(p)} />
          </Col>
        ))}
      </Row>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination
          current={meta.page}
          pageSize={meta.per_page}
          total={meta.total}
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

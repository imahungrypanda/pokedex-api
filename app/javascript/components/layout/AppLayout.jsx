import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Button, Modal } from 'antd'
import CreateForm from '../Home/CreateForm'

const { Header, Content } = Layout

export default function AppLayout({ children }) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
          PokéDex
        </Link>
        <span style={{ flex: 1 }} />
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add Pokémon
        </Button>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
      <Modal
        title="Add Pokémon"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CreateForm onSuccess={() => setAddOpen(false)} />
      </Modal>
    </Layout>
  )
}

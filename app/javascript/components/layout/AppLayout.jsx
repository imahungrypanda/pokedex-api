import React from 'react'
import { Link } from 'react-router-dom'
import { Layout, Button } from 'antd'

const { Header, Content } = Layout

export default function AppLayout({ children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
          PokéDex
        </Link>
        <span style={{ flex: 1 }} />
        <Link to="/new">
          <Button type="primary">Add Pokémon</Button>
        </Link>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
    </Layout>
  )
}

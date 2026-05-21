import 'antd/dist/reset.css'

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Home from './Home'
import Detail from './Detail'
import CreateForm from './Home/CreateForm'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:pokemonId" element={<Detail />} />
        <Route path="/new" element={<CreateForm />} />
      </Routes>
    </AppLayout>
  )
}

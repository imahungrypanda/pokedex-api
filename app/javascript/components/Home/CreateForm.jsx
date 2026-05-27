import React from 'react'
import { Form, Input, Button, message } from 'antd'

export default function CreateForm({ onSuccess }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = React.useState(false)

  const submit = async (values) => {
    setSubmitting(true)
    const data = { id: values.id, name: values.name }
    if (values.image_url) data.image_url = values.image_url

    try {
      const res = await fetch('/api/v1/pokemon/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      message.success(`Added ${values.name}.`)
      form.resetFields()
      onSuccess?.()
    } catch (err) {
      message.error(`Could not add Pokémon: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
      <Form.Item
        label="Pokédex ID"
        name="id"
        rules={[{ required: true, message: 'ID is required' }]}
      >
        <Input type="number" min={1} placeholder="e.g. 1026" />
      </Form.Item>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input placeholder="e.g. mewtwo" />
      </Form.Item>
      <Form.Item label="Image URL" name="image_url">
        <Input placeholder="https://… or /pokemon/N.png" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Add Pokémon
        </Button>
      </Form.Item>
    </Form>
  )
}

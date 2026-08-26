import React from 'react'
import { Card, Skeleton } from 'antd'

export default function CardSkeleton() {
  return (
    <Card
      cover={
        <div style={{ background: '#fafafa', padding: 12, textAlign: 'center', height: 204 }}>
          <Skeleton.Image active style={{ width: 180, height: 180 }} />
        </div>
      }
    >
      <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 1, width: '40%' }} />
    </Card>
  )
}

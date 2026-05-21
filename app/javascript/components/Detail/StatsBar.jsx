import React from 'react'
import { Progress, Typography } from 'antd'

const { Text } = Typography

const STAT_LABELS = {
  hp:              'HP',
  attack:          'Attack',
  defense:         'Defense',
  special_attack:  'Sp. Atk',
  special_defense: 'Sp. Def',
  speed:           'Speed',
}

const STAT_MAX = 255

export default function StatsBar({ stats }) {
  if (!stats) return null
  return (
    <div>
      {Object.entries(STAT_LABELS).map(([key, label]) => {
        const value = stats[key] ?? 0
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Text style={{ width: 80 }}>{label}</Text>
            <Text strong style={{ width: 40, textAlign: 'right' }}>{value}</Text>
            <Progress
              percent={(value / STAT_MAX) * 100}
              showInfo={false}
              strokeColor={value >= 100 ? '#52c41a' : value >= 60 ? '#1890ff' : '#faad14'}
              style={{ flex: 1, marginBottom: 0 }}
            />
          </div>
        )
      })}
    </div>
  )
}

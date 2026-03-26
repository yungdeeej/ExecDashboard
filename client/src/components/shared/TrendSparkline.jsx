import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

export default function TrendSparkline({ data, dataKey, color = '#3b82f6', height = 60 }) {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Tooltip
          contentStyle={{ fontSize: '12px', padding: '4px 8px' }}
          formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : value, dataKey]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

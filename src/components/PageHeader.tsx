import type { ReactNode } from 'react'
import { Typography } from 'antd'

export default function PageHeader({ children }: { children: ReactNode }) {
  return (
    <Typography.Title level={2} className="tb-heading">
      {children}
    </Typography.Title>
  )
}

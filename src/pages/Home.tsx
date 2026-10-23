import { DashboardOutlined, ExperimentOutlined, RightOutlined } from '@ant-design/icons'
import { Card, Flex, Typography, theme } from 'antd'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const tools: { title: string; description: string; to: string; icon: ReactNode }[] = [
  {
    title: 'Calculate Gearing',
    description: 'Engine RPM and road speed for your bike and sprockets',
    to: '/gearing',
    icon: <DashboardOutlined />,
  },
  {
    title: 'Mix Gas',
    description: 'How much 2-stroke oil to add to your gas',
    to: '/mix',
    icon: <ExperimentOutlined />,
  },
]

export default function Home() {
  const { token } = theme.useToken()
  return (
    <section>
      <PageHeader>Choose your task brave adventurer!</PageHeader>
      <div className="tb-stack">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="tb-tool-card">
            <Card hoverable size="small">
              <Flex align="center" gap={token.margin}>
                <span aria-hidden className="tb-tool-icon">
                  {t.icon}
                </span>
                <Flex vertical flex={1}>
                  <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                    {t.title}
                  </Typography.Text>
                  <Typography.Text type="secondary">{t.description}</Typography.Text>
                </Flex>
                <RightOutlined aria-hidden style={{ color: token.colorTextTertiary }} />
              </Flex>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

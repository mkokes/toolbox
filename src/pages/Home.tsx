import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const tasks = [
  { label: 'Calculate Gearing', to: '/gearing' },
  { label: 'Mix Gas', to: '/mix' },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <section>
      <PageHeader>Choose your task brave adventurer!</PageHeader>
      <div className="tb-stack">
        {tasks.map((t) => (
          <Button key={t.to} type="primary" size="large" block onClick={() => navigate(t.to)}>
            {t.label}
          </Button>
        ))}
      </div>
    </section>
  )
}

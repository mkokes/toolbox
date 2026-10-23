import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ onClick }: { onClick?: () => void }) {
  const navigate = useNavigate()
  return (
    <Button type="primary" size="large" block onClick={onClick ?? (() => navigate('/'))}>
      Back
    </Button>
  )
}

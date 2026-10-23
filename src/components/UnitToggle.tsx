import { Flex, Segmented, theme } from 'antd'
import { useUnits } from '../context/UnitsContext'
import type { UnitSystem } from '../lib/units'

const options: { value: UnitSystem; label: string }[] = [
  { value: 'imperial', label: 'Imperial' },
  { value: 'metric', label: 'Metric' },
]

/** Imperial / metric switch. The choice is shared by every tool and remembered between visits. */
export default function UnitToggle() {
  const { units, setUnits } = useUnits()
  const { token } = theme.useToken()
  return (
    <Flex justify="center" style={{ marginBottom: token.margin }}>
      <Segmented<UnitSystem> aria-label="Units" options={options} value={units} onChange={setUnits} />
    </Flex>
  )
}

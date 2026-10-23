import { useState } from 'react'
import { Form, InputNumber, Select } from 'antd'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import UnitToggle from '../components/UnitToggle'
import { useUnits } from '../context/UnitsContext'
import { mixRatios } from '../lib/options'
import { mlToFlOz, oilMl } from '../lib/mix'
import { type UnitSystem, round, unitLabels, volumeFromLitres, volumeToLitres } from '../lib/units'

interface GasAmount {
  value: number
  units: UnitSystem
}

export default function MixGas() {
  const { units } = useUnits()
  const [ratio, setRatio] = useState(50)
  // Keep the amount in the units it was typed in, so switching units converts it without rounding drift.
  const [gas, setGas] = useState<GasAmount | null>(null)

  const litres = gas ? volumeToLitres(gas.value, gas.units) : null
  const shown =
    gas && litres !== null ? (gas.units === units ? gas.value : round(volumeFromLitres(litres, units), 2)) : null
  const ml = litres ? oilMl(litres, ratio) : null

  return (
    <section>
      <PageHeader>Mix Your Oil &amp; Fuel</PageHeader>
      <UnitToggle />
      <output className="tb-callout" style={{ display: 'block' }}>
        {ml !== null
          ? units === 'imperial'
            ? `Add ${ml}ml (${round(mlToFlOz(ml), 1)} fl oz) of oil to your gas`
            : `Add ${ml}ml of oil to your gas`
          : ' '}
      </output>
      <Form layout="vertical">
        <Form.Item htmlFor="ratio" label="Select desired fuel to oil ratio">
          <Select id="ratio" size="large" options={mixRatios} value={ratio} onChange={setRatio} />
        </Form.Item>
        <Form.Item htmlFor="gas" label={`How much gas? (${unitLabels[units].volume})`}>
          <InputNumber
            id="gas"
            size="large"
            style={{ width: '100%' }}
            min={0}
            step={units === 'imperial' ? 0.25 : 0.5}
            inputMode="decimal"
            addonAfter={units === 'imperial' ? 'gal' : 'L'}
            value={shown}
            onChange={(v) => setGas(v === null ? null : { value: v, units })}
          />
        </Form.Item>
      </Form>
      <BackButton />
    </section>
  )
}

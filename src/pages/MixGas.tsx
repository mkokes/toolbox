import { useState } from 'react'
import { Form, InputNumber, Select } from 'antd'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import { mixRatios } from '../lib/options'
import { oilMl } from '../lib/mix'

export default function MixGas() {
  const [ratio, setRatio] = useState(50)
  const [gallons, setGallons] = useState<number | null>(null)

  return (
    <section>
      <PageHeader>Mix Your Oil &amp; Fuel</PageHeader>
      <output className="tb-callout" style={{ display: 'block' }}>
        {gallons ? `Add ${oilMl(gallons, ratio)}ml of oil to your gas` : ' '}
      </output>
      <Form layout="vertical">
        <Form.Item label="Select desired fuel to oil ratio">
          <Select size="large" options={mixRatios} value={ratio} onChange={setRatio} />
        </Form.Item>
        <Form.Item label="How much gas? (Gallons)">
          <InputNumber
            size="large"
            style={{ width: '100%' }}
            min={0}
            step={0.25}
            inputMode="decimal"
            value={gallons}
            onChange={setGallons}
          />
        </Form.Item>
      </Form>
      <BackButton />
    </section>
  )
}

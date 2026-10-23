import { useState } from 'react'
import { Col, Form, Row, Select, Slider, Typography } from 'antd'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import ResultStat from '../components/ResultStat'
import { manufacturers, models, strokeLength } from '../data/engines'
import { pistonDiameters } from '../lib/options'
import { MAX_VE, MIN_VE, calcCarbBore } from '../lib/carb'

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }))

export default function CarbSizing() {
  const [manufacturer, setManufacturer] = useState<string>()
  const [model, setModel] = useState<string>()
  const [piston, setPiston] = useState<number>()
  const [rpm, setRpm] = useState(7500)

  const stroke = manufacturer && model ? strokeLength(manufacturer, model) : undefined
  const ready = stroke !== undefined && piston !== undefined

  return (
    <section>
      <PageHeader>Calculate Carburetor Size</PageHeader>
      {ready ? (
        <Row>
          <Col span={12}>
            <ResultStat label="Min Carb Size" value={`${calcCarbBore(rpm, piston, stroke, MIN_VE)}mm`} />
          </Col>
          <Col span={12}>
            <ResultStat label="Max Carb Size" value={`${calcCarbBore(rpm, piston, stroke, MAX_VE)}mm`} />
          </Col>
        </Row>
      ) : (
        <Typography.Paragraph>
          Note: These sizes should just give you a ballpark range. Volumetric efficiency of a two stroke engine will
          vary widely depending on where the engine's RPMs are in relation to its pipe's powerband.
        </Typography.Paragraph>
      )}
      <Form layout="vertical">
        <Form.Item label="Select an Engine Manufacturer">
          <Select
            size="large"
            placeholder="Please Select A Manufacturer"
            options={toOptions(manufacturers())}
            value={manufacturer}
            onChange={(v) => {
              setManufacturer(v)
              setModel(undefined)
            }}
          />
        </Form.Item>
        {manufacturer && (
          <Form.Item label="Engine">
            <Select
              size="large"
              placeholder="Please Select An Engine Model"
              options={toOptions(models(manufacturer))}
              value={model}
              onChange={setModel}
            />
          </Form.Item>
        )}
        {model && (
          <Form.Item label="What is your piston's diameter? (mm)">
            <Select
              size="large"
              placeholder="Please Select A Piston Diameter"
              options={pistonDiameters}
              value={piston}
              onChange={setPiston}
            />
          </Form.Item>
        )}
        {ready && (
          <Form.Item label={`Desired RPM: ${rpm}`}>
            <Slider min={1} max={15000} value={rpm} onChange={setRpm} />
          </Form.Item>
        )}
      </Form>
      <BackButton />
    </section>
  )
}

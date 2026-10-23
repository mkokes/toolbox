import { useState } from 'react'
import { Button, Col, Form, Row, Select, Slider, Steps } from 'antd'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import ResultStat from '../components/ResultStat'
import { type Engine, findEngine, manufacturers, models, versions } from '../data/engines'
import { sprocketOptions, tireWidths, wheelSizes } from '../lib/options'
import { calcRpm, finalRatio, tireCircumference } from '../lib/gearing'

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }))

interface Setup {
  front: number
  rear: number
  wheel: number
  tire: number
}

const defaultsFor = (e: Engine): Setup => ({
  front: e.defaultfront,
  rear: e.defaultrear,
  wheel: e.defaultwheel,
  tire: e.defaulttire,
})

export default function Gearing() {
  const [step, setStep] = useState(0)
  const [manufacturer, setManufacturer] = useState<string>()
  const [model, setModel] = useState<string>()
  const [version, setVersion] = useState<string>()
  const [setup, setSetup] = useState<Setup>()
  const [mph, setMph] = useState(30)

  const engine = findEngine(manufacturer, model, version)
  const versionList = manufacturer && model ? versions(manufacturer, model) : []
  const sprockets = sprocketOptions(manufacturer ?? '')

  const selectModel = (m: string) => {
    setModel(m)
    setVersion(undefined)
    const e = findEngine(manufacturer, m)
    setSetup(e ? defaultsFor(e) : undefined)
  }

  const selectVersion = (v: string) => {
    setVersion(v)
    const e = findEngine(manufacturer, model, v)
    setSetup(e ? defaultsFor(e) : undefined)
  }

  const update = (patch: Partial<Setup>) => setSetup((s) => (s ? { ...s, ...patch } : s))

  if (step === 1 && engine && setup) {
    const internal = engine.finaldriveratio
    const external = setup.front / setup.rear
    const circumference = tireCircumference(setup.wheel, setup.tire)
    return (
      <section>
        <PageHeader>Calculate RPM &amp; MPH</PageHeader>
        <GearingSteps current={1} />
        <ResultStat label="Crankshaft To Wheel Ratio" value={`${finalRatio(internal, external).toFixed(2)}:1`} />
        <Row>
          <Col span={12}>
            <ResultStat label="RPM" value={calcRpm(internal, external, mph, circumference)} />
          </Col>
          <Col span={12}>
            <ResultStat label="MPH" value={mph} />
          </Col>
        </Row>
        <Slider min={1} max={100} value={mph} onChange={setMph} aria-label="MPH" style={{ margin: '2rem 0 3rem' }} />
        <BackButton onClick={() => setStep(0)} />
      </section>
    )
  }

  return (
    <section>
      <PageHeader>Configure Your Bike</PageHeader>
      <GearingSteps current={0} />
      <Form layout="vertical">
        <Form.Item label="Select a Manufacturer">
          <Select
            size="large"
            placeholder="Please Select A Manufacturer"
            options={toOptions(manufacturers())}
            value={manufacturer}
            onChange={(m) => {
              setManufacturer(m)
              setModel(undefined)
              setVersion(undefined)
              setSetup(undefined)
            }}
          />
        </Form.Item>
        {manufacturer && (
          <Form.Item label="Select a Model">
            <Select
              size="large"
              placeholder="Please Select An Engine Model"
              options={toOptions(models(manufacturer))}
              value={model}
              onChange={selectModel}
            />
          </Form.Item>
        )}
        {versionList.length > 0 && (
          <Form.Item label="Select a Version">
            <Select
              size="large"
              placeholder="Please Select An Engine Version"
              options={toOptions(versionList)}
              value={version}
              onChange={selectVersion}
            />
          </Form.Item>
        )}
        {engine && setup && (
          <>
            <Form.Item label={manufacturer === 'Vespa' ? 'Select a Front Pulley' : 'Select a Front Sprocket'}>
              <Select size="large" options={sprockets.front} value={setup.front} onChange={(front) => update({ front })} />
            </Form.Item>
            <Form.Item label={manufacturer === 'Vespa' ? 'Select a Rear Pulley' : 'Select a Rear Sprocket'}>
              <Select size="large" options={sprockets.rear} value={setup.rear} onChange={(rear) => update({ rear })} />
            </Form.Item>
            <Form.Item label="Select a Wheel Size">
              <Select size="large" options={wheelSizes} value={setup.wheel} onChange={(wheel) => update({ wheel })} />
            </Form.Item>
            <Form.Item label="Select a Tire Width">
              <Select size="large" options={tireWidths} value={setup.tire} onChange={(tire) => update({ tire })} />
            </Form.Item>
          </>
        )}
      </Form>
      <Row gutter={16}>
        <Col span={engine && setup ? 12 : 24}>
          <BackButton />
        </Col>
        {engine && setup && (
          <Col span={12}>
            <Button type="primary" size="large" block onClick={() => setStep(1)}>
              Next
            </Button>
          </Col>
        )}
      </Row>
    </section>
  )
}

function GearingSteps({ current }: { current: number }) {
  return (
    <Steps
      size="small"
      direction="horizontal"
      responsive={false}
      current={current}
      items={[{ title: 'Bike' }, { title: 'RPM & MPH' }]}
      style={{ marginBottom: '1.5rem' }}
    />
  )
}

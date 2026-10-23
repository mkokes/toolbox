import { useState } from 'react'
import { Button, Col, Form, Row, Select, Slider, Steps, theme } from 'antd'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import ResultStat from '../components/ResultStat'
import Tachometer from '../components/Tachometer'
import { type Engine, findEngine, manufacturers, models, versions } from '../data/engines'
import UnitToggle from '../components/UnitToggle'
import { useUnits } from '../context/UnitsContext'
import { sprocketOptions, tireWidths, wheelSizes } from '../lib/options'
import { calcRpm, finalRatio, tireCircumference } from '../lib/gearing'
import { type UnitSystem, speedFromMph, speedToMph, unitLabels } from '../lib/units'

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }))

// 100 mph, and the equivalent round figure in km/h
const MAX_SPEED: Record<UnitSystem, number> = { imperial: 100, metric: 160 }

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
  // Speed is held in mph (unrounded) so switching units never drifts the RPM.
  const [mph, setMph] = useState(30)
  const { units } = useUnits()
  const labels = unitLabels[units]
  const { token } = theme.useToken()

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
    const speed = Math.round(speedFromMph(mph, units))
    return (
      <section>
        <PageHeader>Calculate RPM &amp; {labels.speed}</PageHeader>
        <UnitToggle />
        <GearingSteps current={1} />
        <Tachometer rpm={calcRpm(internal, external, mph, circumference)} />
        <Row>
          <Col span={12}>
            <ResultStat label={labels.speed} value={speed} />
          </Col>
          <Col span={12}>
            <ResultStat label="Crank To Wheel Ratio" value={`${finalRatio(internal, external).toFixed(2)}:1`} />
          </Col>
        </Row>
        <Slider
          min={1}
          max={MAX_SPEED[units]}
          value={speed}
          onChange={(v) => setMph(speedToMph(v, units))}
          aria-label={labels.speed}
          style={{ margin: `${token.margin}px 0 ${token.marginXL}px` }}
        />
        <BackButton onClick={() => setStep(0)} />
      </section>
    )
  }

  return (
    <section>
      <PageHeader>Configure Your Bike</PageHeader>
      <UnitToggle />
      <GearingSteps current={0} />
      <Form layout="vertical">
        <Form.Item htmlFor="manufacturer" label="Select a Manufacturer">
          <Select
            id="manufacturer"
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
          <Form.Item htmlFor="model" label="Select a Model">
            <Select
              id="model"
              size="large"
              placeholder="Please Select An Engine Model"
              options={toOptions(models(manufacturer))}
              value={model}
              onChange={selectModel}
            />
          </Form.Item>
        )}
        {versionList.length > 0 && (
          <Form.Item htmlFor="version" label="Select a Version">
            <Select
              id="version"
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
            <Form.Item
              htmlFor="front"
              label={manufacturer === 'Vespa' ? 'Select a Front Pulley' : 'Select a Front Sprocket'}
            >
              <Select
                id="front"
                size="large"
                options={sprockets.front}
                value={setup.front}
                onChange={(front) => update({ front })}
              />
            </Form.Item>
            <Form.Item
              htmlFor="rear"
              label={manufacturer === 'Vespa' ? 'Select a Rear Pulley' : 'Select a Rear Sprocket'}
            >
              <Select
                id="rear"
                size="large"
                options={sprockets.rear}
                value={setup.rear}
                onChange={(rear) => update({ rear })}
              />
            </Form.Item>
            <Form.Item htmlFor="wheel" label="Select a Wheel Size">
              <Select
                id="wheel"
                size="large"
                options={wheelSizes(units)}
                value={setup.wheel}
                onChange={(wheel) => update({ wheel })}
              />
            </Form.Item>
            <Form.Item htmlFor="tire" label="Select a Tire Width">
              <Select
                id="tire"
                size="large"
                options={tireWidths(units)}
                value={setup.tire}
                onChange={(tire) => update({ tire })}
              />
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
  const { token } = theme.useToken()
  return (
    <Steps
      size="small"
      direction="horizontal"
      responsive={false}
      current={current}
      items={[{ title: 'Bike' }, { title: 'RPM & Speed' }]}
      style={{ marginBottom: token.marginLG }}
    />
  )
}

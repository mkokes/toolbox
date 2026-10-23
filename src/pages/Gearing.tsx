import { useState } from 'react'
import { DeleteOutlined, SaveOutlined, ShareAltOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Collapse,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Slider,
  Steps,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from 'antd'
import { useLocation, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'
import CompareGearing from '../components/CompareGearing'
import ResultStat from '../components/ResultStat'
import Tachometer from '../components/Tachometer'
import UnitToggle from '../components/UnitToggle'
import { manufacturers, models, versions } from '../data/engines'
import { useUnits } from '../context/UnitsContext'
import { useSavedBikes } from '../hooks/useSavedBikes'
import { sprocketOptions, tireWidths, wheelSizes } from '../lib/options'
import { calcRpm, finalRatio, speedAtRpm, tireCircumference } from '../lib/gearing'
import {
  CUSTOM,
  REDUCTION_MAX,
  REDUCTION_MIN,
  TARGET_RPM_DEFAULT,
  TARGET_RPM_MAX,
  TARGET_RPM_MIN,
  describeDrivetrain,
  drivetrainOf,
  engineFor,
  engineRatio,
  isComplete,
  isStock,
  parseSetup,
  parseTargetRpm,
  setupName,
  withStockDrivetrain,
  toSearchParams,
  type Drivetrain,
  type GearingSetup,
} from '../lib/setup'
import { type UnitSystem, speedFromMph, speedToMph, unitLabels } from '../lib/units'

const { Text } = Typography

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }))

// 100 mph, and the equivalent round figure in km/h
const MAX_SPEED: Record<UnitSystem, number> = { imperial: 100, metric: 160 }

/** URL params for the results view; the target RPM is only included when it isn't the default. */
const resultsParams = (s: GearingSetup, rpm: number) =>
  toSearchParams(s, { view: 'results', ...(rpm !== TARGET_RPM_DEFAULT && { rpm: String(rpm) }) })

/** The gearing tool. Its whole setup lives in the URL (`?make=Puch&model=E50&front=16…&view=results`). */
export default function Gearing() {
  const [params, setParams] = useSearchParams()
  const setup = parseSetup(params)
  const targetRpm = parseTargetRpm(params)
  const showResults = params.get('view') === 'results' && isComplete(setup)

  /** Replace the setup in the URL (no new history entry while filling in the form). */
  const update = (next: GearingSetup) => setParams(toSearchParams(next), { replace: true })
  const updateResults = (next: GearingSetup, rpm: number) => setParams(resultsParams(next, rpm), { replace: true })

  return showResults ? (
    <Results
      setup={setup}
      targetRpm={targetRpm}
      onTargetRpm={(rpm) => updateResults(setup, rpm)}
      onUseGearing={(front, rear) => updateResults({ ...setup, front, rear }, targetRpm)}
      onBack={() => update(setup)}
    />
  ) : (
    <SetupForm
      setup={setup}
      update={update}
      onNext={() => setParams(toSearchParams(setup, { view: 'results' }))}
      onOpen={(p) => setParams(new URLSearchParams(`${p}&view=results`))}
    />
  )
}

function SetupForm({
  setup,
  update,
  onNext,
  onOpen,
}: {
  setup: GearingSetup
  update: (s: GearingSetup) => void
  onNext: () => void
  onOpen: (params: string) => void
}) {
  const { units } = useUnits()
  const [editing, setEditing] = useState(false)
  const { make, model } = setup
  const isCustom = make === CUSTOM
  const engineChosen = isCustom || !!engineFor(setup)
  const versionList = make && model && !isCustom ? versions(make, model) : []
  const complete = isComplete(setup)
  const showSelects = engineChosen && (editing || !drivetrainOf(setup))

  const setDrivetrain = (patch: Partial<Drivetrain>) => update({ ...setup, ...patch })

  return (
    <section>
      <PageHeader>Configure Your Bike</PageHeader>
      <UnitToggle />
      <GearingSteps current={0} />
      <MyBikes onOpen={onOpen} />
      <Form layout="vertical">
        <Form.Item htmlFor="manufacturer" label="Select a Manufacturer">
          <Select
            id="manufacturer"
            size="large"
            placeholder="Please Select A Manufacturer"
            options={[...toOptions(manufacturers()), { value: CUSTOM, label: 'Other / custom' }]}
            value={make}
            onChange={(m: string) => {
              setEditing(false)
              update(m === CUSTOM ? withStockDrivetrain({ make: m }) : { make: m })
            }}
          />
        </Form.Item>
        {isCustom && (
          <Form.Item
            htmlFor="reduction"
            label="Engine reduction (crank to output sprocket)"
            extra="The engine's internal ratio, e.g. 5.05 for a Puch E50."
          >
            <InputNumber
              id="reduction"
              key={make}
              size="large"
              style={{ width: '100%' }}
              min={REDUCTION_MIN}
              max={REDUCTION_MAX}
              step={0.05}
              inputMode="decimal"
              addonAfter=": 1"
              // Uncontrolled so partial input (e.g. "1" on the way to "12") isn't wiped by URL validation.
              defaultValue={setup.reduction}
              onChange={(v) => update({ ...setup, reduction: v ?? undefined })}
            />
          </Form.Item>
        )}
        {make && !isCustom && (
          <Form.Item htmlFor="model" label="Select a Model">
            <Select
              id="model"
              size="large"
              placeholder="Please Select An Engine Model"
              options={toOptions(models(make))}
              value={model}
              onChange={(m: string) => {
                setEditing(false)
                update(withStockDrivetrain({ make, model: m }))
              }}
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
              value={setup.version}
              onChange={(v: string) => {
                setEditing(false)
                update(withStockDrivetrain({ make, model, version: v }))
              }}
            />
          </Form.Item>
        )}
        {engineChosen && !showSelects && (
          <DrivetrainSummary setup={setup} units={units} onEdit={() => setEditing(true)} />
        )}
        {showSelects && <DrivetrainSelects setup={setup} units={units} onChange={setDrivetrain} />}
        {showSelects && drivetrainOf(setup) && (
          <Button block onClick={() => setEditing(false)}>
            Done
          </Button>
        )}
      </Form>
      <ActionBar>
        <Row gutter={16}>
          <Col span={complete ? 12 : 24}>
            <BackButton />
          </Col>
          {complete && (
            <Col span={12}>
              <Button type="primary" size="large" block onClick={onNext}>
                Next
              </Button>
            </Col>
          )}
        </Row>
      </ActionBar>
    </section>
  )
}

function DrivetrainSummary({ setup, units, onEdit }: { setup: GearingSetup; units: UnitSystem; onEdit: () => void }) {
  const { token } = theme.useToken()
  const stock = isStock(setup)
  return (
    <Card size="small" style={{ marginBottom: token.marginLG }}>
      <Flex align="center" justify="space-between" gap={token.marginSM}>
        <Flex vertical>
          <Text type="secondary">Drivetrain</Text>
          <Text strong data-testid="drivetrain-summary">
            {describeDrivetrain(setup, units)}
          </Text>
        </Flex>
        <Flex align="center" gap={token.marginXS}>
          <Tag color={stock ? 'success' : 'warning'}>{stock ? 'Stock' : 'Modified'}</Tag>
          <Button onClick={onEdit}>Edit</Button>
        </Flex>
      </Flex>
    </Card>
  )
}

function DrivetrainSelects({
  setup,
  units,
  onChange,
}: {
  setup: GearingSetup
  units: UnitSystem
  onChange: (patch: Partial<Drivetrain>) => void
}) {
  const vespa = setup.make === 'Vespa'
  const sprockets = sprocketOptions(setup.make ?? '')
  return (
    <>
      <Form.Item htmlFor="front" label={vespa ? 'Select a Front Pulley' : 'Select a Front Sprocket'}>
        <Select
          id="front"
          size="large"
          options={sprockets.front}
          value={setup.front}
          onChange={(front) => onChange({ front })}
        />
      </Form.Item>
      <Form.Item htmlFor="rear" label={vespa ? 'Select a Rear Pulley' : 'Select a Rear Sprocket'}>
        <Select
          id="rear"
          size="large"
          options={sprockets.rear}
          value={setup.rear}
          onChange={(rear) => onChange({ rear })}
        />
      </Form.Item>
      <Form.Item htmlFor="wheel" label="Select a Wheel Size">
        <Select
          id="wheel"
          size="large"
          options={wheelSizes(units)}
          value={setup.wheel}
          onChange={(wheel) => onChange({ wheel })}
        />
      </Form.Item>
      <Form.Item htmlFor="tire" label="Select a Tire Width">
        <Select
          id="tire"
          size="large"
          options={tireWidths(units)}
          value={setup.tire}
          onChange={(tire) => onChange({ tire })}
        />
      </Form.Item>
    </>
  )
}

function MyBikes({ onOpen }: { onOpen: (params: string) => void }) {
  const { bikes, remove } = useSavedBikes()
  const { units } = useUnits()
  const { token } = theme.useToken()
  if (bikes.length === 0) return null
  return (
    <Card size="small" title="My bikes" style={{ marginBottom: token.marginLG }}>
      <Flex vertical gap={token.marginSM}>
        {bikes.map((b) => (
          <Flex key={b.id} align="center" gap={token.marginXS}>
            <Flex vertical flex={1} style={{ minWidth: 0 }}>
              <Text strong ellipsis>
                {b.name}
              </Text>
              <Text type="secondary" ellipsis>
                {describeDrivetrain(parseSetup(new URLSearchParams(b.params)), units)}
              </Text>
            </Flex>
            <Button aria-label={`Open ${b.name}`} onClick={() => onOpen(b.params)}>
              Open
            </Button>
            <Popconfirm title="Delete this bike?" okText="Delete" onConfirm={() => remove(b.id)}>
              <Button aria-label={`Delete ${b.name}`} icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}

function Results({
  setup,
  targetRpm,
  onTargetRpm,
  onUseGearing,
  onBack,
}: {
  setup: GearingSetup
  targetRpm: number
  onTargetRpm: (rpm: number) => void
  onUseGearing: (front: number, rear: number) => void
  onBack: () => void
}) {
  // Speed is held in mph (unrounded) so switching units never drifts the RPM.
  const [mph, setMph] = useState(30)
  const { units } = useUnits()
  const labels = unitLabels[units]
  const { token } = theme.useToken()
  const location = useLocation()
  const { save } = useSavedBikes()
  const [messageApi, messageHolder] = message.useMessage()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(() => setupName(setup))

  const internal = engineRatio(setup)!
  const d = drivetrainOf(setup)!
  const external = d.front / d.rear
  const circumference = tireCircumference(d.wheel, d.tire)
  const speed = Math.round(speedFromMph(mph, units))
  const query = toSearchParams(setup).toString()

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${location.pathname}?${resultsParams(setup, targetRpm)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Moped Toolbox: ${setupName(setup)}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        messageApi.success('Link copied')
      }
    } catch {
      // The user closed the share sheet, or the clipboard was blocked; nothing to do.
    }
  }

  return (
    <section>
      {messageHolder}
      <PageHeader>Calculate RPM &amp; {labels.speed}</PageHeader>
      <UnitToggle />
      <GearingSteps current={1} />
      <Flex vertical align="center" style={{ marginBottom: token.margin }}>
        <Text strong>{setupName(setup)}</Text>
        <Text type="secondary">{describeDrivetrain(setup, units)}</Text>
      </Flex>
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
      <Form layout="vertical">
        <Form.Item htmlFor="target-rpm" label="Top speed at a target RPM" extra="e.g. where your pipe makes peak power">
          <InputNumber
            id="target-rpm"
            size="large"
            style={{ width: '100%' }}
            min={TARGET_RPM_MIN}
            max={TARGET_RPM_MAX}
            step={250}
            inputMode="numeric"
            addonAfter="RPM"
            // Uncontrolled so partial input (e.g. "9" on the way to "9500") isn't reset by URL validation.
            defaultValue={targetRpm}
            onChange={(v) => {
              if (v !== null && Number.isInteger(v) && v >= TARGET_RPM_MIN && v <= TARGET_RPM_MAX) onTargetRpm(v)
            }}
          />
        </Form.Item>
      </Form>
      <output className="tb-callout" htmlFor="target-rpm">
        ≈ {Math.round(speedFromMph(speedAtRpm(internal, external, targetRpm, circumference), units))}{' '}
        {labels.speedShort} at {targetRpm.toLocaleString('en-US')} RPM
      </output>
      <Collapse
        style={{ marginBottom: token.margin }}
        items={[
          {
            key: 'compare',
            label: 'Compare gearing (what if…)',
            children: (
              <CompareGearing
                key={`${d.front}/${d.rear}`}
                make={setup.make ?? ''}
                internalRatio={internal}
                base={d}
                mph={mph}
                targetRpm={targetRpm}
                units={units}
                onUse={onUseGearing}
              />
            ),
          },
        ]}
      />
      <Modal
        title="Save to My bikes"
        open={saving}
        okText="Save"
        onOk={() => {
          save(name, query)
          setSaving(false)
          messageApi.success('Saved to My bikes')
        }}
        onCancel={() => setSaving(false)}
      >
        <Form layout="vertical">
          <Form.Item htmlFor="bike-name" label="Name">
            <Input id="bike-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
      <ActionBar>
        <Flex gap={token.marginSM}>
          <Flex flex={1}>
            <BackButton onClick={onBack} />
          </Flex>
          <Tooltip title="Save bike">
            <Button size="large" icon={<SaveOutlined />} aria-label="Save bike" onClick={() => setSaving(true)} />
          </Tooltip>
          <Tooltip title="Share link">
            <Button size="large" icon={<ShareAltOutlined />} aria-label="Share" onClick={share} />
          </Tooltip>
        </Flex>
      </ActionBar>
    </section>
  )
}

/** Back/Next row that sticks to the bottom of the screen on phones. */
function ActionBar({ children }: { children: React.ReactNode }) {
  return <div className="tb-actions">{children}</div>
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

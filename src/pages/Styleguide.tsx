import type { CSSProperties, ReactNode } from 'react'
import { Button, Divider, Form, Input, InputNumber, Select, Slider, Steps, Table, Tag, Typography } from 'antd'
import PageHeader from '../components/PageHeader'
import ResultStat from '../components/ResultStat'
import UnitToggle from '../components/UnitToggle'
import { type ColorName, buttonGradient, colorRoles, colors, fontSizes, fonts, layout, space } from '../theme/tokens'
import { antdTheme } from '../theme/antdTheme'

const { Title, Paragraph, Text } = Typography

// WCAG relative luminance / contrast ratio
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: space.lg }}>
      <Title level={3} style={{ color: colors.green }}>
        {title}
      </Title>
      {children}
    </section>
  )
}

const swatchStyle = (bg: string): CSSProperties => ({
  background: bg,
  height: 56,
  borderRadius: 8,
  border: '1px solid rgba(235,235,235,0.2)',
})

function Swatch({ name, hex, role }: { name: string; hex: string; role?: string }) {
  const ratio = contrast(hex, colors.background)
  return (
    <div style={{ marginBottom: space.md }}>
      <div style={swatchStyle(hex)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: space.xxs }}>
        <Text strong>${name}</Text>
        <Text code copyable>
          {hex}
        </Text>
      </div>
      {role && <Text type="secondary">{role}</Text>}
      {name !== 'background' && (
        <div>
          <Tag color={ratio >= 4.5 ? 'success' : ratio >= 3 ? 'warning' : 'error'} style={{ marginTop: space.xxs }}>
            {ratio.toFixed(2)}:1 on background
          </Tag>
        </div>
      )}
    </div>
  )
}

const tokenRows = Object.entries(antdTheme.token ?? {}).map(([token, value]) => ({
  key: token,
  token,
  value: String(value),
}))

export default function Styleguide() {
  return (
    <div>
      <PageHeader>Styleguide</PageHeader>
      <Paragraph>
        The Moped Toolbox theme, carried over from the original SCSS. Every value on this page is read from{' '}
        <Text code>src/theme/tokens.ts</Text> and <Text code>src/theme/antdTheme.ts</Text>, so update those files rather
        than hard-coding colors in components.
      </Paragraph>

      <Section title="Colors">
        {(Object.keys(colors) as ColorName[]).map((name) => (
          <Swatch key={name} name={name} hex={colors[name]} role={colorRoles[name]} />
        ))}
        <Title level={5}>Button gradient</Title>
        <div style={swatchStyle(`linear-gradient(90deg, ${buttonGradient.start}, ${buttonGradient.end})`)} />
        <Paragraph type="secondary" style={{ marginTop: space.xxs }}>
          Default {buttonGradient.start} → {buttonGradient.end} · hover {buttonGradient.hoverStart} →{' '}
          {buttonGradient.hoverEnd} · active {buttonGradient.active}
        </Paragraph>
      </Section>

      <Section title="Usage">
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li>
            <Text style={{ color: colors.red }}>Red</Text> marks things you act on (buttons, sliders, focus rings) and
            section headings.
          </li>
          <li>
            <Text style={{ color: colors.green }}>Green</Text> marks things you read: calculated results, the site title
            and links.
          </li>
          <li>Keep to a single column with full-width controls; the app is phone-first.</li>
        </ul>
      </Section>

      <Section title="Typography">
        <h1 className="tb-title">Moped Toolbox</h1>
        <Text type="secondary">
          Site title: <Text code>{fonts.display}</Text>, {fontSizes.title}, green
        </Text>
        <Divider />
        <PageHeader>Section Heading</PageHeader>
        <Text type="secondary">Page heading: antd Title level 2, red, centered</Text>
        <Divider />
        <Paragraph>
          Body copy is set in the system font stack at {fontSizes.body} in <Text code>{colors.type}</Text>.
        </Paragraph>
        <Text type="secondary">
          <Text code>{fonts.body}</Text>
        </Text>
        <Divider />
        <ResultStat label={`Result label · ${fontSizes.resultLabel}`} value={`${fontSizes.resultValue} value`} />
        <div className="tb-callout">Callout · {fontSizes.callout}</div>
      </Section>

      <Section title="Spacing & layout">
        {Object.entries(space).map(([name, value]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: space.md, marginBottom: space.xs }}>
            <Text code style={{ width: 48 }}>
              {name}
            </Text>
            <div style={{ width: value, height: 16, background: colors.red, borderRadius: 2 }} />
            <Text type="secondary">{value}</Text>
          </div>
        ))}
        <Paragraph type="secondary" style={{ marginTop: space.md }}>
          Content column: max-width {layout.maxWidth} ({parseFloat(layout.maxWidth) * 16}px), width {layout.width},
          centered. Buttons are {layout.buttonHeight}px tall with a {layout.buttonRadius}px radius.
        </Paragraph>
      </Section>

      <Section title="Components">
        <div className="tb-stack">
          <Button type="primary" size="large" block>
            Primary button
          </Button>
          <Button type="primary" size="large" block className="tb-hover">
            Hover state
          </Button>
          <Button type="primary" size="large" block disabled>
            Disabled
          </Button>
        </div>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="Select">
            <Select
              size="large"
              placeholder="Please Select A Manufacturer"
              options={[{ value: 'Puch', label: 'Puch' }]}
            />
          </Form.Item>
          <Form.Item label="Input">
            <Input size="large" placeholder="Text input" />
          </Form.Item>
          <Form.Item label="InputNumber">
            <InputNumber size="large" style={{ width: '100%' }} defaultValue={1.5} step={0.25} />
          </Form.Item>
          <Form.Item label="Slider">
            <Slider defaultValue={30} min={1} max={100} />
          </Form.Item>
        </Form>
        <Steps size="small" responsive={false} current={0} items={[{ title: 'Bike' }, { title: 'RPM & Speed' }]} />
        <Divider />
        <UnitToggle />
        <Divider />
        <ResultStat label="ResultStat" value="14.20:1" />
      </Section>

      <Section title="antd theme tokens">
        <Paragraph type="secondary">
          Applied through <Text code>ConfigProvider</Text> with <Text code>theme.darkAlgorithm</Text>.
        </Paragraph>
        <Table
          size="small"
          pagination={false}
          dataSource={tokenRows}
          columns={[
            { title: 'Token', dataIndex: 'token', render: (t: string) => <Text code>{t}</Text> },
            { title: 'Value', dataIndex: 'value' },
          ]}
        />
      </Section>
    </div>
  )
}

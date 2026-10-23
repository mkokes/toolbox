import type { ReactNode } from 'react'
import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd'
import BackButton from '../components/BackButton'
import PageHeader from '../components/PageHeader'
import ResultStat from '../components/ResultStat'
import StepBars from '../components/StepBars'
import Tachometer from '../components/Tachometer'
import ThemeToggle from '../components/ThemeToggle'
import UnitToggle from '../components/UnitToggle'
import { useBrandToken, useTheme } from '../context/ThemeContext'
import { AA_LARGE_TEXT, AA_TEXT, contrast } from '../lib/contrast'
import { getAntdTheme } from '../theme/antdTheme'
import { baseToken, brand, colorRoles, palettes, type ThemeMode } from '../theme/tokens'

const { Title, Paragraph, Text } = Typography

const WHITE = baseToken.colorTextLightSolid as string

/** The hex value behind a color role, for a mode. */
const roleColor = (mode: ThemeMode, key: (typeof colorRoles)[number]['key']) =>
  key === 'colorAccent' || key === 'colorHeading' || key === 'gaugeTrack' || key === 'needle'
    ? brand[mode][key]
    : (palettes[mode][key] as string)

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { token } = theme.useToken()
  return (
    <section style={{ marginBottom: token.marginXL }}>
      <Title level={3}>{title}</Title>
      {children}
    </section>
  )
}

function ContrastTag({ ratio, large }: { ratio: number; large?: boolean }) {
  return <Tag color={ratio >= (large ? AA_LARGE_TEXT : AA_TEXT) ? 'success' : 'error'}>{ratio.toFixed(2)}:1</Tag>
}

/** One theme's colors, previewed on that theme's own background with its own antd theme. */
function PalettePreview({ mode }: { mode: ThemeMode }) {
  const bg = roleColor(mode, 'colorBgLayout')
  const t = theme.getDesignToken(getAntdTheme(mode))
  return (
    <ConfigProvider theme={getAntdTheme(mode)}>
      <div
        data-testid={`palette-${mode}`}
        style={{
          background: bg,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          borderRadius: t.borderRadiusLG,
          padding: t.padding,
        }}
      >
        <Title level={4} style={{ marginTop: 0, textTransform: 'capitalize' }}>
          {mode}
        </Title>
        {colorRoles.map((row) => {
          const { key, role, against } = row
          const hex = roleColor(mode, key)
          return (
            <Flex key={key} align="center" gap={t.marginSM} style={{ marginBottom: t.marginSM }}>
              <div
                aria-hidden
                style={{
                  background: hex,
                  width: t.controlHeightLG,
                  height: t.controlHeightLG,
                  borderRadius: t.borderRadius,
                  border: `${t.lineWidth}px solid ${t.colorBorder}`,
                  flexShrink: 0,
                }}
              />
              <Flex vertical flex={1}>
                <Text strong>{key}</Text>
                <Text type="secondary">{role}</Text>
              </Flex>
              <Flex vertical align="end" gap={t.marginXXS}>
                <Text code copyable>
                  {hex}
                </Text>
                {against === 'white' && <ContrastTag ratio={contrast(WHITE, hex)} />}
                {against === 'page' && <ContrastTag ratio={contrast(hex, bg)} large={'large' in row && row.large} />}
              </Flex>
            </Flex>
          )
        })}
      </div>
    </ConfigProvider>
  )
}

const typeScale = [
  'fontSizeSM',
  'fontSize',
  'fontSizeLG',
  'fontSizeXL',
  'fontSizeHeading4',
  'fontSizeHeading3',
  'fontSizeHeading2',
  'fontSizeHeading1',
] as const

const spaceScale = [
  'marginXXS',
  'marginXS',
  'marginSM',
  'margin',
  'marginMD',
  'marginLG',
  'marginXL',
  'marginXXL',
] as const

export default function Styleguide() {
  const { token } = theme.useToken()
  const brandToken = useBrandToken()
  const { resolved } = useTheme()
  const g = brandToken.buttonGradient
  const tokenRows = Object.entries({ ...baseToken, ...palettes[resolved] }).map(([name, value]) => ({
    key: name,
    name,
    value: String(value),
  }))

  return (
    <div>
      <PageHeader>Styleguide</PageHeader>
      <Paragraph>
        Every style in the app comes from antd design tokens defined in <Text code>src/theme/tokens.ts</Text>.
        Components read them with <Text code>theme.useToken()</Text>, plus <Text code>useBrandToken()</Text> for the
        display font, accent green and button gradient, so nothing is hard-coded and both themes stay consistent.
      </Paragraph>

      <Section title="Themes">
        <Flex justify="center" style={{ marginBottom: token.margin }}>
          <ThemeToggle />
        </Flex>
        <Flex vertical gap={token.margin}>
          <PalettePreview mode="dark" />
          <PalettePreview mode="light" />
        </Flex>
        <Title level={5}>Button gradient</Title>
        <div
          aria-hidden
          style={{
            height: token.controlHeightLG,
            borderRadius: token.borderRadiusLG,
            background: `linear-gradient(90deg, ${g.start}, ${g.end})`,
          }}
        />
        <Paragraph type="secondary" style={{ marginTop: token.marginXXS }}>
          Default {g.start} → {g.end} · hover {g.hoverStart} → {g.hoverEnd} · active {g.active}
        </Paragraph>
      </Section>

      <Section title="Usage">
        <ul style={{ paddingLeft: token.paddingLG, margin: 0 }}>
          <li>
            <Text style={{ color: token.colorPrimary }}>Red</Text> marks things you act on (buttons, sliders, focus) and
            section headings.
          </li>
          <li>
            <Text style={{ color: brandToken.colorAccent }}>Green</Text> marks things you read: calculated results, the
            gauge, the site title and links.
          </li>
          <li>
            Dark is the home look: a near-black page, with tiles and the footer one step lighter. Light keeps the same
            layout on a warm off-white with white tiles.
          </li>
          <li>The gauge and its big number are the hero of the results screen; everything else supports them.</li>
          <li>Keep to a single column with full-width controls; the app is phone-first.</li>
          <li>Never hard-code a color, size or font outside src/theme/. Read it from the tokens.</li>
        </ul>
      </Section>

      <Section title="Typography">
        <h1 className="tb-title">Moped Toolbox</h1>
        <Text type="secondary">
          Site title: <Text code>{brandToken.fontFamilyDisplay}</Text> at fontSizeHeading2 ({token.fontSizeHeading2}px)
        </Text>
        <Divider />
        <PageHeader>Section Heading</PageHeader>
        <Text type="secondary">Title level 2 in colorHeading</Text>
        <Divider />
        <ResultStat label="Result label · fontSizeXL" value="Value · fontSizeHeading2" />
        <div className="tb-callout">Callout · fontSizeHeading4</div>
        <Divider />
        {typeScale.map((name) => (
          <Flex key={name} justify="space-between" align="baseline">
            <Text style={{ fontSize: token[name] }}>Aa</Text>
            <Text type="secondary">
              {name} · {token[name]}px
            </Text>
          </Flex>
        ))}
        <Paragraph type="secondary" style={{ marginTop: token.margin }}>
          <Text code>{token.fontFamily}</Text>
        </Paragraph>
      </Section>

      <Section title="Spacing, shape & layout">
        {spaceScale.map((name) => (
          <Flex key={name} align="center" gap={token.margin} style={{ marginBottom: token.marginXS }}>
            <Text code style={{ minWidth: token.controlHeightLG * 2 }}>
              {name}
            </Text>
            <div
              aria-hidden
              style={{
                width: token[name],
                height: token.marginSM,
                background: token.colorPrimary,
                borderRadius: token.borderRadiusXS,
              }}
            />
            <Text type="secondary">{token[name]}px</Text>
          </Flex>
        ))}
        <Paragraph type="secondary" style={{ marginTop: token.margin }}>
          Radii: borderRadius {token.borderRadius}px · borderRadiusLG {token.borderRadiusLG}px (pill buttons, cards).
          Controls: {token.controlHeight}px, large {token.controlHeightLG}px. Content column:{' '}
          {brandToken.contentMaxWidth}px.
        </Paragraph>
      </Section>

      <Section title="Buttons">
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
      </Section>

      <Section title="Controls">
        <Paragraph type="secondary">
          Selects and inputs are filled tiles with a small uppercase label above. Steps are slim bars, and the switches
          are pills.
        </Paragraph>
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
        <StepBars current={0} steps={['Bike', 'RPM & Speed']} />
        <UnitToggle />
      </Section>

      <Section title="Gauge">
        <Paragraph type="secondary">
          The hero of the results screen: the arc fills in the accent color up to the needle, the red zone starts at
          9,000 RPM, and the speed is the big readout.
        </Paragraph>
        <Tachometer rpm={6662} />
      </Section>

      <Section title="Stat tiles">
        <Flex gap={token.marginXS}>
          <ResultStat label="MPH" value={30} />
          <ResultStat label="Crank To Wheel Ratio" value="14.20:1" />
        </Flex>
      </Section>

      <Section title="Footer bar">
        <Paragraph type="secondary">
          The Back / Next bar sticks to the bottom of the screen on long pages, above every control and below popups. A
          soft fade and arrow appear above it while there is more page to scroll. Shown here without sticking.
        </Paragraph>
        <div className="tb-actions tb-actions--static">
          <BackButton onClick={() => {}} />
        </div>
      </Section>

      <Section title="Theme tokens">
        <Paragraph type="secondary">
          Shared tokens plus the {resolved} palette, passed to <Text code>ConfigProvider</Text> with{' '}
          <Text code>theme.{resolved === 'dark' ? 'darkAlgorithm' : 'defaultAlgorithm'}</Text>.
        </Paragraph>
        <Table
          size="small"
          pagination={false}
          dataSource={tokenRows}
          columns={[
            { title: 'Token', dataIndex: 'name', render: (t: string) => <Text code>{t}</Text> },
            { title: 'Value', dataIndex: 'value' },
          ]}
        />
      </Section>
    </div>
  )
}

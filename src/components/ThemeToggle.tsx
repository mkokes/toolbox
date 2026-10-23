import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Segmented, Tooltip } from 'antd'
import { useTheme, type ThemePreference } from '../context/ThemeContext'

const options: { value: ThemePreference; label: React.ReactNode }[] = [
  {
    value: 'light',
    label: (
      <Tooltip title="Light">
        <SunOutlined aria-label="Light theme" />
      </Tooltip>
    ),
  },
  {
    value: 'system',
    label: (
      <Tooltip title="Auto (match your device)">
        <DesktopOutlined aria-label="Match system theme" />
      </Tooltip>
    ),
  },
  {
    value: 'dark',
    label: (
      <Tooltip title="Dark">
        <MoonOutlined aria-label="Dark theme" />
      </Tooltip>
    ),
  },
]

/** Light · Auto · Dark switch. Auto follows the browser/OS preference; the choice is remembered. */
export default function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  return <Segmented<ThemePreference> size="small" options={options} value={preference} onChange={setPreference} />
}

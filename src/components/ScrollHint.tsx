import { DownOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { hasMoreBelow } from '../lib/scroll'

/**
 * A soft fade with a chevron at the bottom of the screen while there is more page below. It sits just above the
 * sticky action bar when the page has one, and disappears once the user reaches the bottom.
 */
export default function ScrollHint() {
  const [more, setMore] = useState(false)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const update = () => {
      setMore(hasMoreBelow(document.documentElement))
      setOffset(document.querySelector<HTMLElement>('.tb-actions')?.offsetHeight ?? 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Content changes size as steps, results and dropdowns appear; the body's height follows it.
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    observer?.observe(document.body)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer?.disconnect()
    }
  }, [])

  return (
    <div
      className={`tb-scroll-hint${more ? ' tb-scroll-hint--visible' : ''}`}
      style={{ bottom: offset }}
      aria-hidden="true"
    >
      <DownOutlined />
    </div>
  )
}

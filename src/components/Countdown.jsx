import { useEffect, useMemo, useState } from 'react'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function Countdown({ expiresAt }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [])

  const { text, expired } = useMemo(() => {
    if (!expiresAt) return { text: '--:--', expired: false }
    const diff = Math.max(0, expiresAt - now)
    const totalSeconds = Math.floor(diff / 1000)
    const mm = Math.floor(totalSeconds / 60)
    const ss = totalSeconds % 60
    return { text: `${pad2(mm)}:${pad2(ss)}`, expired: diff === 0 }
  }, [expiresAt, now])

  return (
    <span className={expired ? 'font-extrabold text-rose-700' : 'font-extrabold'}>
      {text}
    </span>
  )
}



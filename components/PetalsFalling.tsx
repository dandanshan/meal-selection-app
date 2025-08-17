'use client'
import { useEffect, useState } from 'react'
import styles from './PetalsFalling.module.css'
import { useTheme } from './ThemeProvider'

const PETAL_COUNT = 18
const KEYFRAMES = [
  'sakura-fall-0',
  'sakura-fall-1',
  'sakura-fall-2',
  'sakura-fall-3',
  'sakura-fall-4',
]

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }

function randomPetal(windowWidth: number) {
  const size = Math.floor(Math.random() * 4) + 6
  const left = randomFloat(0, windowWidth - size)
  const keyframes = randomPick(KEYFRAMES)
  return {
    left,
    top: randomFloat(-15, -5) + 'vh',
    width: size,
    height: size + randomInt(3, 8),
    borderRadius: `${size + randomInt(10, 22)}px ${randomInt(6, size/1.7)}px`,
    background: `linear-gradient(120deg, rgba(255, 183, 192, 0.92), rgba(249, 179, 192, 0.93))`,
    duration: randomFloat(7, 14),
    delay: randomFloat(0, 7),
    keyframes,
  }
}

export default function PetalsFalling() {
  const { theme } = useTheme()
  const [petals, setPetals] = useState<any[]>([])
  const [windowWidth, setWindowWidth] = useState(1200)

  useEffect(() => {
    if (theme !== 'hakka') { setPetals([]); return }
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    setWindowWidth(window.innerWidth)
    setPetals(Array.from({ length: PETAL_COUNT }, () => randomPetal(window.innerWidth)))
    return () => window.removeEventListener('resize', onResize)
  }, [theme])

  const handleEnd = (i: number) => {
    setPetals(prev => {
      const n = [...prev]
      n[i] = randomPetal(windowWidth)
      return n
    })
  }

  if (theme !== 'hakka') return null

  return (
    <div className={styles.petals} aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className={styles.sakura}
          style={{
            left: `${p.left}px`,
            top: p.top,
            width: `${p.width}px`,
            height: `${p.height}px`,
            borderRadius: p.borderRadius,
            background: p.background,
            pointerEvents: 'none',
            opacity: 0,
            animationName: p.keyframes,
            animationDuration: `${p.duration}s`,
            animationTimingFunction: 'linear',
            animationDelay: `${p.delay}s`,
            animationFillMode: 'forwards',
          }}
          onAnimationEnd={() => handleEnd(i)}
        />
      ))}
    </div>
  )
}
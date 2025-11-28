'use client'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
// TypeScript interfaces
interface KeypadProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onHint: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}

export default function Keypad({ value, onChange, onSubmit, onHint, inputRef }: KeypadProps) {
  const t = useTranslations()

  // Focus input after keypad interaction
  const handleChange = (newValue: string) => {
    onChange(newValue)
    // Force focus back to input immediately
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const handleSubmit = () => {
    onSubmit()
    // Force focus back to input immediately  
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const handleHint = () => {
    onHint()
    // Force focus back to input immediately
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't interfere with input fields - only handle keys when no input is focused
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }

      if (/^\d$/.test(e.key)) {
        onChange((value + e.key).slice(0, 3))
        inputRef?.current?.focus()
      }
      else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1))
        inputRef?.current?.focus()
      }
      else if (e.key === 'Enter') {
        onSubmit()
        inputRef?.current?.focus()
      }
      else if (e.key.toLowerCase() === 'h') {
        onHint()
        inputRef?.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [value, onChange, onSubmit, onHint, inputRef])

  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-300">
      <div className="text-center mb-2">
        <div className="text-lg opacity-60">🔢</div>
        <p className="text-xs text-gray-500">{t('keypad.title')}</p>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('keypad.title')}>
        {digits.map(d => (
          <button
            key={d}
            className="rounded-lg text-xl py-2 font-semibold bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow transition-all"
            onMouseDown={(e) => {
              e.preventDefault() // Prevent button from stealing focus
              handleChange((value + d).slice(0, 3))
            }}
            aria-label={`${t('keypad.number')} ${d}`}
          >
            {d}
          </button>
        ))}

        {/* Backspace button */}
        <button
          className="rounded-lg py-2 text-lg font-semibold bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 shadow-sm hover:shadow transition-all"
          onMouseDown={(e) => {
            e.preventDefault()
            handleChange(value.slice(0, -1))
          }}
          aria-label={t('keypad.delete')}
        >
          ⌫
        </button>

        {/* Enter button */}
        <button
          className="rounded-lg py-2 text-sm font-semibold bg-nutti-primary text-white border border-nutti-primary hover:bg-nutti-primary/90 shadow-sm hover:shadow transition-all"
          onMouseDown={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          aria-label={t('keypad.submit')}
        >
          {t('icons.checkmark')} Enter
        </button>

        {/* Hint button */}
        <button
          className="rounded-lg py-2 text-sm font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm hover:shadow transition-all"
          onMouseDown={(e) => {
            e.preventDefault()
            handleHint()
          }}
          aria-label={t('keypad.hint')}
        >
          {t('icons.lightbulb')} {t('play.hint')}
        </button>
      </div>
    </div>
  )
}

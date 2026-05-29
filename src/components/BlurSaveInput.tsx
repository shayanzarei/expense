import { useEffect, useState, type KeyboardEvent } from 'react'

function onEnterBlur(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') e.currentTarget.blur()
}

interface NumberProps {
  saved: number
  onSave: (value: number) => void
  placeholder?: string
  className?: string
  syncKey?: string | number
}

export function BlurSaveNumberInput({
  saved,
  onSave,
  placeholder,
  className,
  syncKey,
}: NumberProps) {
  const [value, setValue] = useState(formatNumberDisplay(saved))

  useEffect(() => {
    setValue(formatNumberDisplay(saved))
  }, [saved, syncKey])

  const save = () => {
    const parsed = parseFloat(value)
    const next = Number.isNaN(parsed) ? 0 : parsed
    if (next === saved) return
    onSave(next)
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      className={`text-[var(--color-ink)] ${className ?? ''}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={onEnterBlur}
    />
  )
}

interface TextProps {
  saved: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  syncKey?: string | number
}

export function BlurSaveTextInput({
  saved,
  onSave,
  placeholder,
  className,
  syncKey,
}: TextProps) {
  const [value, setValue] = useState(saved)

  useEffect(() => {
    setValue(saved)
  }, [saved, syncKey])

  const save = () => {
    if (value === saved) return
    onSave(value)
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`text-[var(--color-ink)] ${className ?? ''}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={onEnterBlur}
    />
  )
}

function formatNumberDisplay(n: number): string {
  return n > 0 ? String(n) : ''
}

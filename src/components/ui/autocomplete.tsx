'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface AutocompleteOption {
  symbol: string
  name: string
}

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (option: AutocompleteOption) => void
  placeholder?: string
  type: 'STOCK' | 'CRYPTO'
  className?: string
}

export function Autocomplete({ value, onChange, onSelect, placeholder, type, className }: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapper_ref = useRef<HTMLDivElement>(null)
  const input_ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapper_ref.current && !wrapper_ref.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTickers = async () => {
      if (value.length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/tickers/search?q=${encodeURIComponent(value)}&type=${type}`)
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounce_timer = setTimeout(searchTickers, 300)
    return () => clearTimeout(debounce_timer)
  }, [value, type])

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.symbol)
    onSelect(option)
    setShowSuggestions(false)
    input_ref.current?.blur()
  }

  return (
    <div ref={wrapper_ref} className={cn('relative', className)}>
      <Input
        ref={input_ref}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onFocus={() => value.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
          )}
          {!loading && suggestions.map((option, index) => (
            <button
              key={`${option.symbol}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="font-medium text-sm">{option.symbol}</div>
              <div className="text-xs text-gray-500">{option.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


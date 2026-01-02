'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface TextAutocompleteProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
  id?: string
  required?: boolean
}

export function TextAutocomplete({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className,
  id,
  required
}: TextAutocompleteProps) {
  const [show_suggestions, setShowSuggestions] = useState(false)
  const [filtered_options, setFilteredOptions] = useState<string[]>([])
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
    if (!show_suggestions || options.length === 0) {
      setFilteredOptions([])
      return
    }

    const lower_value = value.toLowerCase().trim()
    if (lower_value === '') {
      // Show all options when input is empty
      setFilteredOptions(options)
    } else {
      // Filter options that start with or contain the input value
      const filtered = options.filter(option => 
        option.toLowerCase().includes(lower_value)
      )
      setFilteredOptions(filtered)
    }
  }, [value, options, show_suggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (options.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleSelect = (option: string) => {
    onChange(option)
    setShowSuggestions(false)
    input_ref.current?.blur()
  }

  return (
    <div ref={wrapper_ref} className={cn('relative', className)}>
      <Input
        ref={input_ref}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full"
        required={required}
      />
      {show_suggestions && filtered_options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered_options.map((option, index) => (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


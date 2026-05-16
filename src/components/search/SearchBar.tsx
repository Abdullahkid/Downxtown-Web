'use client'

/**
 * SearchBar — controlled text input with voice search, debounce, and filter badge.
 *
 * Requirements: 8.2, 8.3, 8.4, 8.10, 8.11
 */

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Search, Mic, MicOff, X, SlidersHorizontal } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchBarProps {
  /** Current raw (un-debounced) value of the input. */
  value: string
  /** Called on every keystroke with the new raw value. */
  onChange: (value: string) => void
  /**
   * Called with the debounced value after 300 ms of inactivity.
   * Use this to trigger API calls.
   */
  onDebouncedChange: (value: string) => void
  /** Called when the user submits (Enter key or voice result). */
  onSubmit: (query: string) => void
  /** Called when the search bar gains focus. */
  onFocus?: () => void
  /** Called when the search bar loses focus. */
  onBlur?: () => void
  /** Number of currently active filters — shown as a badge on the filter button. */
  activeFilterCount?: number
  /** Called when the filter button is tapped. */
  onFilterOpen?: () => void
  /** Placeholder text. */
  placeholder?: string
  /** Whether to auto-focus the input on mount. */
  autoFocus?: boolean
}

// ---------------------------------------------------------------------------
// SpeechRecognition type shim
// ---------------------------------------------------------------------------

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SearchBar renders a controlled text input with:
 *  - 300 ms debounce via useDebounce (Req 8.3)
 *  - Voice search via Web Speech API with graceful fallback (Req 8.2)
 *  - Filter button with active-filter badge (Req 8.2, 8.9)
 *  - Clear button when input is non-empty
 */
export function SearchBar({
  value,
  onChange,
  onDebouncedChange,
  onSubmit,
  onFocus,
  onBlur,
  activeFilterCount = 0,
  onFilterOpen,
  placeholder = 'Search stores and products…',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported] = useState(() => getSpeechRecognition() !== null)

  // Debounced value — fires onDebouncedChange after 300 ms (Req 8.3)
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    onDebouncedChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  // ---------------------------------------------------------------------------
  // Voice search
  // ---------------------------------------------------------------------------

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) {
        onChange(transcript)
        onSubmit(transcript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [onChange, onSubmit])

  const stopVoiceSearch = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopVoiceSearch()
    } else {
      startVoiceSearch()
    }
  }, [isListening, startVoiceSearch, stopVoiceSearch])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Keyboard submit
  // ---------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault()
        onSubmit(value.trim())
      }
    },
    [value, onSubmit],
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search input container */}
      <div
        className={[
          'flex items-center flex-1 gap-2 px-3 py-2.5',
          'rounded-xl border bg-white',
          'border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100',
          'transition-all duration-150',
        ].join(' ')}
      >
        {/* Search icon */}
        <Search
          size={18}
          className="shrink-0 text-gray-400"
          aria-hidden="true"
        />

        {/* Text input */}
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search stores and products"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={[
            'flex-1 min-w-0 bg-transparent text-sm text-gray-900',
            'placeholder:text-gray-400 outline-none',
            // Remove browser default search cancel button
            '[&::-webkit-search-cancel-button]:hidden',
          ].join(' ')}
        />

        {/* Clear button — shown when input has text */}
        {value.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            className="shrink-0 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}

        {/* Voice search button — hidden when not supported */}
        {voiceSupported && (
          <button
            type="button"
            aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
            aria-pressed={isListening}
            onClick={handleVoiceToggle}
            className={[
              'shrink-0 p-1 rounded-full transition-colors',
              'min-h-[32px] min-w-[32px] flex items-center justify-center',
              isListening
                ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            {isListening ? (
              <MicOff size={16} aria-hidden="true" />
            ) : (
              <Mic size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Filter button with badge (Req 8.2, 8.9) */}
      {onFilterOpen && (
        <button
          type="button"
          aria-label={
            activeFilterCount > 0
              ? `Filters — ${activeFilterCount} active`
              : 'Open filters'
          }
          onClick={onFilterOpen}
          className={[
            'relative shrink-0 flex items-center justify-center',
            'min-h-[44px] min-w-[44px] rounded-xl border transition-colors',
            activeFilterCount > 0
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50',
          ].join(' ')}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />

          {/* Active filter count badge */}
          {activeFilterCount > 0 && (
            <span
              aria-hidden="true"
              className={[
                'absolute -top-1.5 -right-1.5',
                'flex items-center justify-center',
                'h-4 min-w-[16px] px-1 rounded-full',
                'bg-blue-600 text-white text-[10px] font-bold leading-none',
              ].join(' ')}
            >
              {activeFilterCount > 9 ? '9+' : activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

'use client'

/**
 * MessageInput — chat message composition bar.
 *
 * - Textarea with send button for TEXT messages.
 * - Image upload button: uploads via `POST /upload`, then sends imageId via WebSocket.
 * - Share product/store actions: opens a picker modal.
 *
 * Requirements: 15.4, 15.5, 15.6
 */

import React, { useRef, useState, useCallback, KeyboardEvent } from 'react'
import { Send, ImageIcon, ShoppingBag, Store, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api/apiClient'
import type { OutgoingMessage } from '@/types/chat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UploadResponse {
  imageId: string
}

export interface MessageInputProps {
  roomId: string
  onSend: (msg: OutgoingMessage) => void
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Share picker modal
// ---------------------------------------------------------------------------

type ShareMode = 'product' | 'store' | null

interface SharePickerProps {
  mode: ShareMode
  onShare: (id: string) => void
  onClose: () => void
}

function SharePicker({ mode, onShare, onClose }: SharePickerProps) {
  const [inputValue, setInputValue] = useState('')

  if (!mode) return null

  const label = mode === 'product' ? 'Product ID' : 'Store username'
  const placeholder = mode === 'product' ? 'Enter product ID…' : 'Enter store username…'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${mode}`}
    >
      <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Share {mode === 'product' ? 'Product' : 'Store'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={[
            'w-full px-3 py-2 rounded-lg border border-gray-300',
            'text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          ].join(' ')}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = inputValue.trim()
            if (trimmed) {
              onShare(trimmed)
              onClose()
            }
          }}
          disabled={!inputValue.trim()}
          className={[
            'mt-3 w-full py-2.5 rounded-lg text-sm font-semibold',
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
          ].join(' ')}
        >
          Share
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MessageInput({ roomId, onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [shareMode, setShareMode] = useState<ShareMode>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Reset height then set to scrollHeight for auto-grow
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleSendText = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend({ roomId, type: 'TEXT', text: trimmed })
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend, roomId])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (without Shift) on desktop
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendText()
      }
    },
    [handleSendText]
  )

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || disabled) return

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        // Upload image and get imageId (Req 15.6)
        const { imageId } = await api.post<UploadResponse>('/upload', formData, {
          headers: {}, // Let browser set multipart boundary
        })

        onSend({ roomId, type: 'IMAGE', imageId })
      } catch {
        // TODO: show toast error
      } finally {
        setUploading(false)
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [disabled, onSend, roomId]
  )

  const handleShareProduct = useCallback(
    (productId: string) => {
      onSend({ roomId, type: 'SHARED_PRODUCT', sharedProductId: productId })
    },
    [onSend, roomId]
  )

  const handleShareStore = useCallback(
    (storeId: string) => {
      onSend({ roomId, type: 'SHARED_STORE', sharedStoreId: storeId })
    },
    [onSend, roomId]
  )

  const canSend = text.trim().length > 0 && !disabled

  return (
    <>
      {/* Share picker modal */}
      {shareMode && (
        <SharePicker
          mode={shareMode}
          onShare={shareMode === 'product' ? handleShareProduct : handleShareStore}
          onClose={() => setShareMode(null)}
        />
      )}

      {/* Input bar */}
      <div
        className={[
          'flex items-end gap-2 px-3 py-2',
          'bg-white border-t border-gray-200',
          'safe-area-inset-bottom',
        ].join(' ')}
        role="group"
        aria-label="Message input"
      >
        {/* Action buttons */}
        <div className="flex items-center gap-1 pb-1">
          {/* Image upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className={[
              'p-2 rounded-full text-gray-500',
              'hover:bg-gray-100 active:bg-gray-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
            ].join(' ')}
            aria-label="Upload image"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            ) : (
              <ImageIcon size={20} aria-hidden="true" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Share product */}
          <button
            type="button"
            onClick={() => setShareMode('product')}
            disabled={disabled}
            className={[
              'p-2 rounded-full text-gray-500',
              'hover:bg-gray-100 active:bg-gray-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
            ].join(' ')}
            aria-label="Share product"
          >
            <ShoppingBag size={20} aria-hidden="true" />
          </button>

          {/* Share store */}
          <button
            type="button"
            onClick={() => setShareMode('store')}
            disabled={disabled}
            className={[
              'p-2 rounded-full text-gray-500',
              'hover:bg-gray-100 active:bg-gray-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
            ].join(' ')}
            aria-label="Share store"
          >
            <Store size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={disabled}
          rows={1}
          className={[
            'flex-1 resize-none rounded-2xl px-4 py-2.5',
            'bg-gray-100 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors max-h-[120px] overflow-y-auto',
          ].join(' ')}
          aria-label="Message text"
          aria-multiline="true"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSendText}
          disabled={!canSend}
          className={[
            'flex-shrink-0 w-11 h-11 rounded-full',
            'flex items-center justify-center',
            'bg-blue-600 text-white',
            'hover:bg-blue-700 active:bg-blue-800',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors',
          ].join(' ')}
          aria-label="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </>
  )
}

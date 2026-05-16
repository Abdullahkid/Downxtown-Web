'use client'

/**
 * ReturnForm — inline return request form.
 *
 * Features:
 *  - ReturnReason enum selector (radio chips)
 *  - Comments textarea
 *  - Up to 3 image uploads (uploaded via api.post('/upload'))
 *  - Calls api.post('/orders/{id}/return') on submit
 *  - Preserves form data on API error so the buyer can retry
 *
 * Requirements: 14.8, 14.9, 14.10
 */

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api/apiClient'

// ---------------------------------------------------------------------------
// ReturnReason enum
// ---------------------------------------------------------------------------

export type ReturnReason =
  | 'DEFECTIVE'
  | 'WRONG_ITEM'
  | 'NOT_AS_DESCRIBED'
  | 'CHANGED_MIND'
  | 'OTHER'

const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE:        'Defective / Damaged',
  WRONG_ITEM:       'Wrong Item Received',
  NOT_AS_DESCRIBED: 'Not as Described',
  CHANGED_MIND:     'Changed My Mind',
  OTHER:            'Other',
}

const RETURN_REASONS: ReturnReason[] = [
  'DEFECTIVE',
  'WRONG_ITEM',
  'NOT_AS_DESCRIBED',
  'CHANGED_MIND',
  'OTHER',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReturnFormProps {
  orderId: string
  /** Called when the return request is submitted successfully */
  onSuccess: () => void
  /** Called when the user cancels the form */
  onCancel: () => void
}

interface UploadedImage {
  /** Local object URL for preview */
  previewUrl: string
  /** Server-assigned image ID after upload */
  imageId: string | null
  /** Upload in progress */
  uploading: boolean
  /** Upload error */
  error: string | null
}

// ---------------------------------------------------------------------------
// ReturnForm
// ---------------------------------------------------------------------------

export function ReturnForm({ orderId, onSuccess, onCancel }: ReturnFormProps) {
  const [reason, setReason] = useState<ReturnReason | null>(null)
  const [comments, setComments] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // -------------------------------------------------------------------------
  // Image upload
  // -------------------------------------------------------------------------
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (files.length === 0) return

      // Enforce max 3 images total
      const remaining = 3 - images.length
      const toUpload = files.slice(0, remaining)

      // Create placeholder entries immediately for optimistic UI
      const placeholders: UploadedImage[] = toUpload.map((file) => ({
        previewUrl: URL.createObjectURL(file),
        imageId: null,
        uploading: true,
        error: null,
      }))

      setImages((prev) => [...prev, ...placeholders])

      // Upload each file
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i]!
        const placeholderIndex = images.length + i

        try {
          const formData = new FormData()
          formData.append('file', file)

          // api.post with FormData — omit Content-Type so browser sets multipart boundary
          const response = await api.post<{ imageId: string }>(
            '/upload',
            formData,
            { headers: {} },
          )

          setImages((prev) =>
            prev.map((img, idx) =>
              idx === placeholderIndex
                ? { ...img, imageId: response.imageId, uploading: false }
                : img,
            ),
          )
        } catch {
          setImages((prev) =>
            prev.map((img, idx) =>
              idx === placeholderIndex
                ? { ...img, uploading: false, error: 'Upload failed' }
                : img,
            ),
          )
        }
      }

      // Reset file input so the same file can be re-selected after removal
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [images.length],
  )

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!reason) return

      setSubmitting(true)
      setSubmitError(null)

      try {
        const uploadedImageIds = images
          .filter((img) => img.imageId !== null)
          .map((img) => img.imageId as string)

        await api.post(`/orders/${orderId}/return`, {
          reason,
          comments: comments.trim() || undefined,
          imageIds: uploadedImageIds,
        })

        onSuccess()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to submit return request. Please try again.'
        // Preserve form data — only update the error message (Req 14.10)
        setSubmitError(message)
      } finally {
        setSubmitting(false)
      }
    },
    [reason, comments, images, orderId, onSuccess],
  )

  const canSubmit = reason !== null && !submitting && images.every((img) => !img.uploading)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      aria-label="Return request form"
      noValidate
    >
      {/* ------------------------------------------------------------------ */}
      {/* Reason selector                                                     */}
      {/* ------------------------------------------------------------------ */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-800 mb-3">
          Reason for Return <span className="text-red-500" aria-hidden="true">*</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Return reason">
          {RETURN_REASONS.map((r) => {
            const isSelected = reason === r
            return (
              <label
                key={r}
                className={[
                  'inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium',
                  'border cursor-pointer transition-colors',
                  'focus-within:outline focus-within:outline-2',
                  'focus-within:outline-offset-2 focus-within:outline-blue-600',
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="returnReason"
                  value={r}
                  checked={isSelected}
                  onChange={() => setReason(r)}
                  className="sr-only"
                  aria-label={RETURN_REASON_LABELS[r]}
                />
                {RETURN_REASON_LABELS[r]}
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------ */}
      {/* Comments textarea                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <label
          htmlFor="return-comments"
          className="block text-sm font-semibold text-gray-800 mb-1.5"
        >
          Additional Comments
          <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="return-comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Describe the issue in more detail…"
          className={[
            'w-full px-3 py-2.5 rounded-xl border border-gray-200',
            'text-sm text-gray-900 placeholder-gray-400',
            'resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-shadow',
          ].join(' ')}
          aria-describedby="return-comments-count"
        />
        <p
          id="return-comments-count"
          className="mt-1 text-xs text-gray-400 text-right"
          aria-live="polite"
        >
          {comments.length}/500
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Image upload (up to 3)                                              */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">
          Photos
          <span className="ml-1 text-xs font-normal text-gray-400">(up to 3, optional)</span>
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Uploaded image previews */}
          {images.map((img, index) => (
            <div
              key={img.previewUrl}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={`Return photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Upload overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="text-white animate-spin" aria-hidden="true" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                  <AlertCircle size={18} className="text-white" aria-hidden="true" />
                </div>
              )}

              {/* Success indicator */}
              {!img.uploading && !img.error && img.imageId && (
                <div className="absolute bottom-1 right-1">
                  <CheckCircle2 size={14} className="text-green-400" aria-hidden="true" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className={[
                  'absolute top-1 right-1 w-5 h-5 rounded-full',
                  'bg-black/60 text-white flex items-center justify-center',
                  'hover:bg-black/80 transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
                ].join(' ')}
                aria-label={`Remove photo ${index + 1}`}
              >
                <X size={10} aria-hidden="true" />
              </button>
            </div>
          ))}

          {/* Add photo button — hidden when 3 images already added */}
          {images.length < 3 && (
            <label
              className={[
                'w-20 h-20 rounded-xl border-2 border-dashed border-gray-300',
                'flex flex-col items-center justify-center gap-1',
                'cursor-pointer text-gray-400 hover:border-blue-400 hover:text-blue-500',
                'transition-colors focus-within:outline focus-within:outline-2',
                'focus-within:outline-offset-2 focus-within:outline-blue-600',
              ].join(' ')}
              aria-label="Add photo"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload return photos"
              />
              <Upload size={18} aria-hidden="true" />
              <span className="text-xs font-medium">Add</span>
            </label>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Submit error (Req 14.10 — form data preserved)                     */}
      {/* ------------------------------------------------------------------ */}
      {submitError && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Action buttons                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={[
            'flex-1 py-3 rounded-xl text-sm font-semibold',
            'border border-gray-200 text-gray-700 bg-white',
            'hover:bg-gray-50 active:bg-gray-100 transition-colors',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            'flex-1 py-3 rounded-xl text-sm font-semibold',
            'bg-blue-600 text-white',
            'hover:bg-blue-700 active:bg-blue-800 transition-colors',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2',
          ].join(' ')}
          aria-busy={submitting}
        >
          {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {submitting ? 'Submitting…' : 'Submit Return Request'}
        </button>
      </div>
    </form>
  )
}

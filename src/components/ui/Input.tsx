import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered above the input */
  label?: string
  /** Error message — when truthy, applies red border and renders error text below the field */
  error?: string
  /** Helper text rendered below the field when there is no error */
  helperText?: string
  /** Disables the input and applies reduced-opacity cursor-not-allowed styling */
  disabled?: boolean
}

/**
 * Accessible Input primitive.
 *
 * - Uses `React.useId()` to generate a stable id that links the `<label>` to
 *   the `<input>` via `htmlFor` / `id`.
 * - Error state: `border-app-error focus:ring-app-error` + error text below.
 * - Normal state: `border-gray-300 focus:ring-brand focus:border-brand`.
 * - Helper text is shown only when there is no error.
 * - Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, error, helperText, disabled, className = '', id: idProp, ...rest },
    ref,
  ) {
    const generatedId = React.useId()
    const inputId = idProp ?? generatedId

    const baseClasses =
      'w-full rounded-lg px-3 py-2 text-base border outline-none transition-colors min-h-[44px]'

    const stateClasses = error
      ? 'border-app-error focus:ring-2 focus:ring-app-error focus:border-app-error'
      : 'border-gray-300 focus:ring-2 focus:ring-brand focus:border-brand'

    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed'

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
          {...rest}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-app-error text-sm" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-gray-500 text-sm">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input

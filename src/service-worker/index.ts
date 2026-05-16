/**
 * Service Worker entry point for @ducanh2912/next-pwa.
 *
 * @ducanh2912/next-pwa looks for `<customWorkerSrc>/index.{js,ts}` as the
 * custom worker entry. This file simply re-exports everything from `sw.ts`
 * so that the actual implementation lives in the spec-defined `sw.ts` file.
 *
 * Requirements: 18.4, 18.5, 24.7, 24.8
 */
export * from './sw'

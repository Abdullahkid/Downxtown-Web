'use client'

/**
 * useInfiniteScroll — wraps TanStack Query `useInfiniteQuery` and wires up an
 * Intersection Observer so the next page is fetched automatically when the
 * sentinel element enters the viewport.
 *
 * Requirements: 8.3
 *
 * @example
 * const { data, isLoading, ref } = useInfiniteScroll({
 *   queryKey: ['feed'],
 *   queryFn: ({ pageParam }) => api.get(`/feed?page=${pageParam}`),
 *   getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
 * })
 * // Attach `ref` to the last list item or a dedicated sentinel <div>.
 */

import { useEffect, useRef, useCallback } from 'react'
import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type QueryFunction,
  type GetNextPageParamFunction,
} from '@tanstack/react-query'

interface UseInfiniteScrollOptions<TData, TPageParam = number> {
  queryKey: QueryKey
  queryFn: QueryFunction<TData, QueryKey, TPageParam>
  getNextPageParam: GetNextPageParamFunction<TPageParam, TData>
  /** Initial page parameter. Defaults to 1. */
  initialPageParam?: TPageParam
}

interface UseInfiniteScrollResult<TData> {
  data: InfiniteData<TData> | undefined
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  error: Error | null
  /** Attach this ref to the sentinel element at the bottom of the list. */
  ref: (node: Element | null) => void
}

export function useInfiniteScroll<TData, TPageParam = number>({
  queryKey,
  queryFn,
  getNextPageParam,
  initialPageParam,
}: UseInfiniteScrollOptions<TData, TPageParam>): UseInfiniteScrollResult<TData> {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<TData, Error, InfiniteData<TData>, QueryKey, TPageParam>({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam: (initialPageParam ?? 1) as TPageParam,
  })

  // Keep a stable reference to the observer so we can disconnect on cleanup.
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Callback ref — called whenever the sentinel element mounts/unmounts.
  const ref = useCallback(
    (node: Element | null) => {
      // Disconnect any previous observer.
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { threshold: 0.1 },
      )

      observerRef.current.observe(node)
    },
    // Re-create the observer when pagination state changes so the callback
    // always has fresh values for `hasNextPage` and `isFetchingNextPage`.
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  // Disconnect the observer when the component unmounts.
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return {
    data,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
    error: error ?? null,
    ref,
  }
}

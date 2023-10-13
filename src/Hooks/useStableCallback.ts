// From https://gist.github.com/rolandcoops/4364be2eff3586b0f8f3d0c10dc3be61

// Taken (with some minor changes) from:
// https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback

import { useRef, useEffect, useCallback, MutableRefObject } from 'react'

const throwReferenceError = () => {
  throw new ReferenceError('Callback was called directly while rendering, pass it as a callback prop instead.')
}

/**
 * Custom hook that wraps an unstable callback inside a stable wrapper callback.
 * Useful to e.g. keep an event handler prop stable when passing it down.
 *
 *
 * @example
 * // `handleClick` reference will not change even if deps change:
 * const handleClick = useStableCallback((event) => {
 *   console.log(someDep, event.target)
 * }, [someDep])
 */
const useStableCallback = (callback: any, deps: Array<any>): any => {
  const ref: MutableRefObject<() => any | (() => never)> = useRef(throwReferenceError)

  // update stored callback ref if callback or deps change
  useEffect(() => {
    ref.current = callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps])

  // return stable wrapped callback
  return useCallback((...args: []) => {
    ref.current(...args)
  }, [ref])
}

export default useStableCallback
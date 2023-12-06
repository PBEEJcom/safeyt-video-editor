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
declare const useStableCallback: (callback: any, deps: Array<any>) => any;
export default useStableCallback;

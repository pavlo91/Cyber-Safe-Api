export {}

declare global {
  type MaybePromise<T> = Promise<T> | T
}

export function mapCount<T>(count: number, callback: () => T) {
  const data: T[] = []

  for (let i = 0; i < count; i++) {
    data.push(callback())
  }

  return data
}

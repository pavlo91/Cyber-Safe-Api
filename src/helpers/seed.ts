export function mapCount<T>(count: number, callback: (index: number) => T) {
  const data: T[] = []

  for (let i = 0; i < count; i++) {
    data.push(callback(i))
  }

  return data
}

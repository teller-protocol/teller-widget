export function uniqueByField<T extends Record<string, any>>(
  array: T[],
  field: keyof T
): T[] {
  const seen = new Set<string | number>();
  return array.filter((item) => {
    const value = item[field];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

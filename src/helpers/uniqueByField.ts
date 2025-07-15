export function uniqueByField<T extends Record<string, any>>(
  array: T[],
  field: keyof T
): T[] {
  if (!array) return [];

  const seen = new Set<string | number>();
  return array.filter((item) => {
    if (!item) return false;

    const value = item[field];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

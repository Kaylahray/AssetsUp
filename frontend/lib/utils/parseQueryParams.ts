export function parseQueryParams(query: string | URLSearchParams): Record<string, string> {
  const params = new URLSearchParams(query instanceof URLSearchParams ? query.toString() : query);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};
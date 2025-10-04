import { parseQueryParams } from './parseQueryParams';

describe('parseQueryParams', () => {

  it('should parse a standard query string', () => {
    const query = '?page=2&limit=10';
    const result = parseQueryParams(query);
    expect(result).toEqual({ page: '2', limit: '10' });
  });

  it('should work with empty query string', () => {
    const query = '';
    const result = parseQueryParams(query);
    expect(result).toEqual({});
  });

  it('should work with URLSearchParams', () => {
    const searchParams = new URLSearchParams({ page: '5', sort: 'desc' });
    const result = parseQueryParams(searchParams);
    expect(result).toEqual({ page: '5', sort: 'desc' });
  });

  it('should handle query strings without "?"', () => {
    const query = 'foo=bar&baz=qux';
    const result = parseQueryParams(query);
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('should handle repeated keys by keeping the last value', () => {
    const query = '?key=1&key=2';
    const result = parseQueryParams(query);
    expect(result).toEqual({ key: '2' });
  });
});
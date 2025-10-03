import { generateRandomId } from './generateRandomId';

describe('generateRandomId', () => {
  it('should return a string', () => {
    const id = generateRandomId();
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateRandomId()));
    expect(ids.size).toBe(1000); // no collisions in sample
  });

  it('should fallback when crypto.randomUUID is not available', () => {
    const originalCrypto = global.crypto;
    // @ts-ignore
    delete global.crypto;

    const id = generateRandomId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);

    global.crypto = originalCrypto;
  });

  it('should use crypto.randomUUID if available', () => {
    const mockUUID = 'mock-uuid-1234';
    const originalCrypto = global.crypto;
    // @ts-ignore
    global.crypto = { randomUUID: jest.fn(() => mockUUID) };

    const id = generateRandomId();
    expect(id).toBe(mockUUID);

    global.crypto = originalCrypto;
  });
});
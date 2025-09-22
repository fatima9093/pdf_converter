import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../config';

describe('Config', () => {
  test('API_BASE_URL is defined', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  test('GOOGLE_CLIENT_ID is defined', () => {
    expect(GOOGLE_CLIENT_ID).toBeDefined();
    expect(typeof GOOGLE_CLIENT_ID).toBe('string');
  });

  test('API_BASE_URL has valid format', () => {
    expect(API_BASE_URL).toMatch(/^https?:\/\/.+/);
  });
});

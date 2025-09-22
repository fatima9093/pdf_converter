// Simple test to verify Jest is working
describe('Jest Setup', () => {
  test('basic math operations work', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
  });

  test('string operations work', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('WORLD'.toLowerCase()).toBe('world');
    expect('test'.length).toBe(4);
  });

  test('array operations work', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr.includes(3)).toBe(true);
    expect(arr.includes(6)).toBe(false);
  });

  test('object operations work', () => {
    const obj = { name: 'Test', age: 25 };
    expect(obj.name).toBe('Test');
    expect(obj.age).toBe(25);
    expect(Object.keys(obj)).toEqual(['name', 'age']);
  });
});

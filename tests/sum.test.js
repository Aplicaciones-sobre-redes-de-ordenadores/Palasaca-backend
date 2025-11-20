// tests/sum.test.js

describe("Sum function", () => {
  test("should add 2 + 2 and equal 5 (erróneo)", () => {
    const result = 2 + 2;
    expect(result).toBe(5); // ❌ Esto está mal a propósito
  });
});

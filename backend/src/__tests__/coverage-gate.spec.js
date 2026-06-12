function soma(a, b) {
  return a + b
}

describe('Coverage gate canário', () => {
  it('o ambiente Jest está rodando corretamente', () => {
    expect(soma(2, 3)).toBe(5)
  })
})
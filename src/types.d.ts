declare module NodeJS {
  interface Global {
    fetch: typeof window.fetch
  }
}

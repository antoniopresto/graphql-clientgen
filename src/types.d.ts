declare module NodeJS {
  interface Global {
    fetch: typeof window.fetch
  }
}

// type Modify<T, R> = Omit<T, keyof R> & R;

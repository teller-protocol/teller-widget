declare global {
  interface Window {
    __adrsbl: {
      queue: any[];
      run: (...args: any[]) => void;
    };
  }
}
export {};

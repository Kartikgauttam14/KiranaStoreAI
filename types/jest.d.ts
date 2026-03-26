/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      [key: string]: any;
    }

    type Mock<T = any> = {
      (...args: any[]): T;
      mock: { calls: any[][]; results: any[] };
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: any[]) => T): Mock<T>;
      mockImplementationOnce(fn: (...args: any[]) => T): Mock<T>;
      mockResolvedValue(value: T): Mock<Promise<T>>;
      mockResolvedValueOnce(value: T): Mock<Promise<T>>;
      mockRejectedValue(value: any): Mock<Promise<T>>;
      mockRejectedValueOnce(value: any): Mock<Promise<T>>;
      mockReturnValue(value: T): Mock<T>;
      mockReturnValueOnce(value: T): Mock<T>;
    };
  }
  
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function expect(value: any): any;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  function fail(message?: string): void;
  
  namespace jest {
    function mock(moduleName: string, factory?: () => any): void;
    function fn<T = any>(implementation?: (...args: any[]) => T): Mock<T>;
    function clearAllMocks(): void;
  }
}

export {};


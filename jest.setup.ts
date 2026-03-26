// jest.setup.ts
// This file is used to set up Jest globally

declare global {
  var describe: jest.Describe;
  var it: jest.It;
  var test: jest.It;
  var expect: jest.Expect;
  var beforeAll: jest.HookFn;
  var afterAll: jest.HookFn;
  var beforeEach: jest.HookFn;
  var afterEach: jest.HookFn;
}

export {};

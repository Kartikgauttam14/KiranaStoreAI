declare module '@testing-library/react-native' {
  export interface RenderOptions {
    [key: string]: any;
  }

  export interface RenderResult {
    getByText(text: string | RegExp): any;
    getByTestId(testID: string): any;
    queryByText(text: string | RegExp): any;
    queryByTestId(testID: string): any;
    getAllByText(text: string | RegExp): any[];
    getAllByTestId(testID: string): any[];
    rerender(element: any): void;
    unmount(): void;
    [key: string]: any;
  }

  export function render(
    element: any,
    options?: RenderOptions
  ): RenderResult;

  export function fireEvent(options: any): any;
  export namespace fireEvent {
    function press(element: any): void;
    function changeText(element: any, text: string): void;
  }

  export const screen: {
    getByText(text: string | RegExp): any;
    getByTestId(testID: string): any;
    queryByText(text: string | RegExp): any;
    queryByTestId(testID: string): any;
    getAllByText(text: string | RegExp): any[];
    getAllByTestId(testID: string): any[];
    [key: string]: any;
  };
}

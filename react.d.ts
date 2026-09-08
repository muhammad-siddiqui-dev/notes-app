/* eslint-disable no-unused-vars */
declare module "react" {
  export function useState<T>(initial: T): [T, (value: T) => void];
  export interface FormEvent<T = Element> {
    preventDefault(): void;
  }
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

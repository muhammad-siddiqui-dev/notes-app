/* eslint-disable no-unused-vars */
declare module "react" {
  export function useState<T>(initial: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export interface FormEvent<T = Element> {
    preventDefault(): void;
  }
  export interface ChangeEvent<T = Element> {
    target: T & { value: string };
    preventDefault(): void;
  }
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

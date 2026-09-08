/* eslint-disable no-unused-vars */
declare module "pg" {
  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
  }
  export class Pool {
    constructor(config?: PoolConfig);
    query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>
    connect(): Promise<{ query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>; release: () => void }>;
  }
}

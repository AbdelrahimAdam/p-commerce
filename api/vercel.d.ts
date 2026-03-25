// /api/vercel.d.ts
declare module '@vercel/node' {
  export interface VercelRequest {
    body: any
    query: any
    headers: any
    method: string
  }
  export interface VercelResponse {
    status(code: number): this
    json(data: any): void
    send(data: any): void
  }
}
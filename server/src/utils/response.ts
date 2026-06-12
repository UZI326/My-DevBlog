import type { Response } from 'express'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}

export function sendResponse<T = unknown>(
  res: Response,
  code: number,
  message: string,
  data: T | null = null,
): void {
  res.json({ code, message, data } as ApiResponse<T>)
}

export type LogEntry = {
  level: string,
  message?: string,
  data?: any,
  index?: number,
  [key: string]: any
}

export const LogLevels: Array<string> = [
  'qq',
  'q',
  'log',
  'v',
  'vv',
  'vvv'
]
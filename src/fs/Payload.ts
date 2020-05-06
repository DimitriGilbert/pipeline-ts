import { Payload } from "../Payload"

export type FsPayload = {
  path: string
} & Payload

export type readPayload = {
  asBuffer?: boolean
  sanitize?: (data: string | Buffer) => string | Buffer
} & FsPayload

export type copyPayload = {
  to: string
  force?: boolean
  bak?: boolean | string
} & FsPayload

export type writePayload = {
  sanitizeTo?: (data: string | Buffer) => string | Buffer
  data: string | Buffer
} & copyPayload

export type operationPayload = {
  type: string
} & FsPayload

export type writeOperationPayload = {
  length: number
} & operationPayload

export type mkdirPayload = {
  noRecursive?: boolean
} & FsPayload


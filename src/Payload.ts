import { is } from "ts-type-guards";

export type Payloadable = {
  [key: string]: any
}
export type Payload = Payloadable | Array<Payloadable> | Promise<Payloadable | Array<Payloadable>>

export function isPromise(param: any): param is Promise<Payloadable> {
  return is(Promise)(param)
}

export function isArray(param: any): param is Array<Payloadable> {
  return is(Array)(param)
}

export function isPayload(param: any): param is Payload {
  return isPromise(param) || isArray(param) || (param && typeof param === "object")
}

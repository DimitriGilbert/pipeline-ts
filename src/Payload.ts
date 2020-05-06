import { is } from "ts-type-guards";

export type Payloadable = {
  [key: string]: any
}
export type PayloadBase = Payloadable | Array<Payloadable>
export type Payload = PayloadBase | Promise<PayloadBase>

export function isPromise(param: any): param is Promise<PayloadBase> {
  return is(Promise)(param)
}

export function isArray(param: any): param is Array<PayloadBase> {
  return is(Array)(param)
}

export function isPayload(param: any): param is Payload {
  return isPromise(param) || isArray(param) || (param && typeof param === "object")
}

import { Payload, ParentPipelineInterface } from "../src";

export function basic(
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
): Payload {
  return payload
}

export function promised(
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
): Payload {
  return new Promise((resolve, reject) => {
    resolve(payload)
  })
}

export function long(
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
): Payload {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(payload)
    }, 1000)
  })
}
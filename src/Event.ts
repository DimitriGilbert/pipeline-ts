import { Payloadable } from "./Payload"
import { Pipeline } from "./Pipeline"


export type PipelineEventListenerData = {
  payload?: Payloadable
  evtName?: string
  index?: number
}

export type PipelineEventListener = (
  pipeline: Pipeline,
  data: PipelineEventListenerData
) => void

export const PipelineEventList = {
  start: "start",
  complete: "complete",
  beforeStage: "beforeStage",
  afterStage: "afterStage",
  error: "error",
  log: "log",
  pipe: "pipe",
  addStage: "addStage",
}
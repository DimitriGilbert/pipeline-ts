import { Payload, Payloadable } from "./Payload";
import { ParentPipelineInterface, PipeableCondition } from "./Pipeline";
import { is } from "ts-type-guards";

export function isStageExecutor(param: any): param is StageExecutor & StageBase {
  return is(Function)(param)
}

export function isStage(param: any): param is Stage {
  return is(Object)(param) && param.hasOwnProperty('executor')
}

export type StageBase = (
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
) => Payload

export type StageExecutor = (
  payload: Payloadable,
  parent?: ParentPipelineInterface,
  index?: number
) => Payload

export type StageFilter = {
  in?: (payload: Payloadable) => Payloadable,
  out?: (unfilteredPayload: Payloadable, nestPayload: Payloadable) => Payloadable
}

export type Stage = {
  executor: StageExecutor,
  status?: string,
  done: boolean,
  running: boolean,
  name?: string,
  condition?: PipeableCondition,
  filter?: StageFilter,
  [key: string]: any
}

export function MakeStage (
  executor: StageExecutor,
  name?: string,
  condition?: PipeableCondition,
  filter?: StageFilter
): Stage {
  let stg: Stage = {
    executor: executor,
    status: 'ready',
    done: false,
    running: false
  }
  if (name) {
    stg.name = name
  }
  if (condition) {
    stg.condition = condition
  }
  if (filter) {
    stg.filter = filter
  }
  return stg
}

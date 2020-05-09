import { Payload } from "./Payload";
import { ParentPipelineInterface, PipeableCondition } from "./Pipeline";
import { is } from "ts-type-guards";

export function isStage(param: any): param is StageBase {
  return is(Function)(param)
}

export type StageBase = (
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
) => Payload

export type StageExecutor = (
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
) => Payload

export type Stage = {
  executor: StageExecutor,
  status?: string,
  done: boolean,
  running: boolean,
  name?: string,
  condition?: PipeableCondition
  [key: string]: any
}

export function isBetterStage (param: any): param is Stage {
  return is(Object)(param)
    && param.executor !== undefined
    && is(Function)(param.executor)
}
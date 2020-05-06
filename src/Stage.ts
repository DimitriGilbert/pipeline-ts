import { Payload } from "./Payload";
import { ParentPipelineInterface } from "./Pipeline";
import { is } from "ts-type-guards";

export function isStage(param: any): param is StageBase {
  return is(Function)(param)
}

export type StageBase = (
  payload: Payload,
  parent?: ParentPipelineInterface,
  index?: number
) => Payload
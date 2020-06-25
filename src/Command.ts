import minimist from "minimist";
import { Container, hasEvent } from ".";
import { Payloadable, isPromise } from ".";
import { Pipeable, MinimalPipelineInterface, isMinimalPipeline, Pipeline } from ".";

export const ReservedOptions = [
  "pipeline",
  "pipelineStages"
]

export class Command {
  container: Container
  args: Payloadable
  payload: Payloadable
  stages: Array<Pipeable> = []
  pipeline?: Pipeline

  constructor (container: Container, args?: Array<string>) {
    this.container = container
    this.args = {}
    this.payload = {}
    if (args) {
      this.parseArgs(args)
    }
  }

  parseArgs(args: Array<string>): this {
    this.args = minimist(args.slice(2))
    for (let argName in this.args) {
      if (this.args.hasOwnProperty(argName)) {
        if (argName === "_") {
          if (this.args[argName].length > 0) {
            this.parseStages(this.args[argName])
          }
        }
        else if (ReservedOptions.indexOf(argName) === -1) {
          this.payload[argName] = this.args[argName]
        }
        else {
          this.parseReservedOptions(argName, this.args[argName])
        }
      }
    }
    return this
  }

  parseReservedOptions(argName: string, arg: string | boolean | number): this {
    switch (argName) {
      case "pipelineStages":
        if (typeof arg === "string") {
          this.parseStages(arg)
        }
        break;    
      default:
        throw new Error("Unknown option "+ argName)
    }
    return this
  }

  parseStages(stagesStr: string | Array<string>): this {
    let stgs: Array<string>
    if (typeof stagesStr === "string") {
      stgs = stagesStr.split(",")
    } else {
      stgs = stagesStr
    }
    this.stages = this.stages.concat(stgs.map((stgStr: string): Pipeable => {
      return this.container.getInstance(stgStr)
    }))
    return this
  }

  parsePipeline(pipelineStr: string): this {
    let p = this.container.getInstance(pipelineStr)
    if (isMinimalPipeline(p)) {
      // @ts-ignore
      this.pipeline = p
    }
    return this
  }

  process() {
    return new Promise((resolve, reject) => {
      if (!this.pipeline) {
        this.pipeline = new Pipeline()
      }
      if (hasEvent(this.pipeline)) {
        this.pipeline.addEventListener('error', (ppl, data) => {
          console.log(ppl, data)
        })
        this.pipeline.addEventListener('stage_afterStage', (ppl, data) => {
          console.log(`stage ${data.index}/${this.pipeline?.stages.length} has done ${ppl.stageIndex + 1}/${ppl.stages.length}`)
        })
      }
      this.stages.forEach((stage: Pipeable) => {
        this.pipeline?.pipe(stage)
      })

      let result = this.pipeline.process(this.payload)
      if (isPromise(result)) {
        result.then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
      }
      else {
        resolve(result)
      }
    })
  }
}
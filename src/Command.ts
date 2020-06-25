import minimist from "minimist";
import { Container, hasEvent } from ".";
import { Payloadable, isPromise } from ".";
import { Pipeable, MinimalPipelineInterface, isMinimalPipeline, Pipeline } from ".";
import { PipelineEventListenerData } from "./Event";

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
          console.error(ppl, data)
        })
        
        this.pipeline.addEventListener('done', (ppl, data) => {
          this.reportProgress({payload:data})
        })
        this.pipeline.addEventListener('stage_start', (ppl, data) => {
          this.reportProgress(data)
        })
        this.pipeline.addEventListener('stage_beforeStage', (ppl, data) => {
          this.reportProgress(data)
        })
        this.pipeline.addEventListener('stage_afterStage', (ppl, data) => {
          this.reportProgress(data)
        })
        this.pipeline.addEventListener('stage_stageSkiped', (ppl, data) => {
          this.reportProgress(data)
        })
        this.pipeline.addEventListener('stage_done', (ppl, data) => {
          this.reportProgress(data)
        })
        this.pipeline.addEventListener('stage_completed', (ppl, data) => {
          this.reportProgress(data)
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

  reportProgress(d: PipelineEventListenerData) {
    let report = this.pipeline?.progressReport()
    let out = "Starting..."
    if (report) {
      out = `Command ${report.name}: ${report.status} ${report.status==="running"?`${report.progress}% complete`:""}`

      if (report.status==="running"
        && d.payload
        && d.payload.payload
        && d.payload.payload.pipeline
      ) {
        let pReport = d.payload.payload.pipeline.progressReport()
        out += `\n\t${pReport.name}: ${pReport.status} ${pReport.status==="running"?`${pReport.progress}% complete`:""}`
        if (d.payload.payload.pipeline.currentStage) {
          out += `\n\t\t${d.payload.payload.pipeline.currentStage.name} -> ${d.payload.payload.pipeline.currentStage.status}`
        }
      }
      else if (report.status === "done") {
        report.stagesStatus.forEach((stageStatus, index) => {
          out += `\n\t${stageStatus.name} ${index + 1}/${report?.length} -> ${stageStatus.status}`
        })
      }
    }
    console.clear()
    console.log(out)
  }
}
import { is, isArrayOf } from "ts-type-guards";
import { PipelineOptions, PipelineEventListenerOptions } from "./Options";
import { LogEntry } from "./Log";
import { StageBase, isStage } from "./Stage";
import { Payload, isPromise, Payloadable } from "./Payload";
import { PipelineEventListener, PipelineEventList, PipelineEventListenerData } from "./Event";
import { WriteFile, ReadFile } from "./fs/Stage";
import { WriteFileOptions } from "fs";
import { writePayload } from "./fs/Payload";

export interface PipeablePipelineInterface {
  asStage: StageBase
}

export type PipeableBase = StageBase | PipeablePipelineInterface
export type Pipeable =  StageBase | PipeablePipelineInterface | Array<StageBase | PipeablePipelineInterface>
export type PipeableCondition = (payload: Payload, parent: ParentPipelineInterface) => boolean

export function isPipeablePipeline(param: any): param is PipeablePipelineInterface {
  return is(Object)(param) && is(Function)(param.asStage)
}

export function isPipes(param: any): param is Array<Pipeable> {
  return isArrayOf(Object)(param) || isArrayOf(Function)(param)
}

export function isPipe(param: any): param is Pipeable {
  return is(Function)(param) || isPipeablePipeline(param)
}

export function isPipeable(param: any): param is Pipeable {
  return param && (typeof param === "function" || (
    typeof param === "object"
    && param.stage
    && typeof param.stage === "function"
  ))
}

export interface ParentPipelineInterface {
  options: PipelineOptions
  name:string
  parent?: ParentPipelineInterface
  parentIndex?: number
  log(currentIndex: number, log: LogEntry): void
  completed(
    currentIndex?: number,
    payload?: Payload,
    resolve?: (value?: Payload) => void
  ): boolean
  error(currentIndex: number | undefined, message: string, payload: Payloadable, data?: any): void
  savePayload(payload: Payloadable, path?: string): void
  readPayload(path: string): Payload
}

export interface MinimalPipelineInterface extends ParentPipelineInterface, PipeablePipelineInterface {
  running?: boolean;
  interupted?: boolean;
  errors?: Array<any>;
  pipe(stage: Pipeable, condition?: PipeableCondition): this
  process(payload:Payload, start?: number, options?: PipelineOptions): Payload
}

export class PipelineProperties {
  stages: Array<StageBase> = []
  stageConditions: Array<PipeableCondition | undefined> = []
  logs: Array<LogEntry> = []
  options: PipelineOptions = {};
  parent?: ParentPipelineInterface;
  parentIndex?: number;
  running?: boolean;
  interupted?: boolean;
  errors?: any[];
  done?: Array<boolean> = [];
  processReject?: (reason: any) => void
}

export class Pipeline extends PipelineProperties implements MinimalPipelineInterface {
  _name?: string
  constructor(stages?: Pipeable, options: PipelineOptions = {}, name?: string) {
    super()
    if (stages) {
      this.pipe(stages)
    }
    this.options = options
    if (name) {
      this._name = name
    }
    this.running = false
  }

  get name(): string {
    if (this._name) {
      return this._name
    }
    let name = Object.getPrototypeOf(this).constructor.name
    if (this.parent) {
      name += '_'+this.parent.name
    }
    return name
  }

  addEventListener(name: string, event: PipelineEventListener): boolean {
    if (name in PipelineEventList) {
      if (!this.options.eventListeners) {
        this.options.eventListeners = <PipelineEventListenerOptions>{}
      }
      // @ts-ignore
      if (!this.options.eventListeners[name]) {
        // @ts-ignore
        this.options.eventListeners[name] = <Array<PipelineEventListener>>[]
      }
      // @ts-ignore
      if (!is(Array)(this.options.eventListeners[name])) {
        // @ts-ignore
        this.options.eventListeners[name] = [this.options.eventListeners[name]]
      }
      // @ts-ignore
      this.options.eventListeners[name].push(event)
      return true
    }
    return false
  }

  removeEventListener(name: string, event: PipelineEventListener): boolean {
    if (name in PipelineEventList) {
      if (!this.options.eventListeners) {
        return true
      }
      // @ts-ignore
      if (!this.options.eventListeners[name]) {
        return true
      }
      // @ts-ignore
      if (!is(Array)(this.options.eventListeners[name])) {
        // @ts-ignore
        this.options.eventListeners[name] = [this.options.eventListeners[name]]
      }
      // @ts-ignore
      let index = this.options.eventListeners[name].indexOf(event)
      if(index !== -1) {
        // @ts-ignore
        this.options.eventListeners[name] = [].concat(
          // @ts-ignore
          this.options.eventListeners[name].slice(0, index),
          // @ts-ignore
          this.options.eventListeners[name].slice(index+1)
        )
        return true
      }
    }
    return false
  }

  triggerHook(name: string, payload: Payload, index?: number): Promise<Payload> {
    return new Promise((resolve, reject) => {
      if (
        !this.options.hooks ||
        (this.options.hooks && !this.options.hooks[name])
      ) {
        resolve(payload)
      }
      else {
        let hookPipeline = new Pipeline(
          this.options.hooks[name].pipeable,
          this.options.hooks[name].options
        )
        hookPipeline.parent = this
        hookPipeline.parentIndex = 999999998

        hookPipeline.process(payload).catch((err) => {
          this.error(index?index:999999997, 'hook error', err)
          reject(err)
        }).then((hookPayload) => {
          // @ts-ignore
          resolve(hookPayload)
        })
      }
    })
  }

  triggerEventListener(name: string, payload?: Payload, index?: number): void {
    if (name in PipelineEventList
      && this.options.eventListeners
      // meeeehhhh
      // @ts-ignore
      && this.options.eventListeners[name]
    ) {
      let d: PipelineEventListenerData = {}
      if (payload !== undefined) {
        d.payload = payload
      }
      if (index !== undefined) {
        d.index = index
      }
      // @ts-ignore
      if (is(Array)(this.options.eventListeners[name])) {
        // @ts-ignore
        this.options.eventListeners[name].forEach(
          (evt: PipelineEventListener) => {
            evt(this, d)
          }
        )
      }
      else {
        // @ts-ignore
        this.options.eventListeners[name](this, d)
      }
    }
  }

  pipe(stage: Pipeable, condition?: PipeableCondition): this {
    this.triggerEventListener('pipe', {stage: stage})

    if (isPipes(stage)) {
      stage.forEach((s) => {
        this.pipe(s, condition)
      })
    }
    
    if (isPipeablePipeline(stage)) {
      stage = stage.asStage
    }

    if (isStage(stage)) {
      this.addStage(stage, condition)
    }

    return this
  }

  addStage(stage: StageBase, condition?: PipeableCondition): this {
    this.stages.push(stage)
    this.stageConditions.push(condition)
    this.done?.push(false)
    this.triggerEventListener('addStage', {stage: stage})
    return this
  }

  log(currentIndex: number, log: LogEntry): void {
    if (this.options.log?.keep) {
      log.index = currentIndex
      this.logs.push(log)
    }

    this.triggerEventListener('log', log, currentIndex)
    
    this.parent?.log(this.parentIndex?this.parentIndex:0, {
      level:log.level,
      message:log.message,
      data:{
        index: currentIndex,
        data:log.data
      }
    })
  }

  error(currentIndex: number, message: string, payload: Payloadable, data?: any): void {
    this.interupted = true
    this.running = false
    
    this.logs.push({
      level: "error",
      index: currentIndex,
      message: message,
      data:data
    })

    this.triggerEventListener('error', payload, currentIndex)

    this.parent?.error(this.parentIndex?this.parentIndex:0, message, payload, {
      index:currentIndex,
      piepline:Object.getPrototypeOf(this),
      data:data
    })
  }

  completed(
    currentIndex?: number,
    payload?: Payload,
    resolve?: (value?: Payload) => void
  ): boolean {
    if (currentIndex !== undefined && this.done && !this.done[currentIndex]) {
      this.done[currentIndex] = true
    }

    function finish(
      resolver: ((value?: Payload) => void),
      output: Payload,
      t: MinimalPipelineInterface
    ): Payload {
      if (t.options?.output?.clean) {
        let c = t.options.output.clean
        if (!is(Array)(c)) {
          c = [c]
        }
        c.forEach((cleaner) => {
          if (is(String)(cleaner)) {
            // @ts-ignore
            output[cleaner] = undefined
            // @ts-ignore
            delete output[cleaner]
          }
          else {
            output = cleaner(output)
          }
        })
      }

      let o: Payload = {}
      if (t.options?.output?.wrapper) {
        o[t.options.output.wrapper] = output
      }
      else {
        o = output
      }

      if (t.options?.output?.save) {
        let path
        if (typeof t.options.output.save === "string") {
          path = t.options.output.save
        }
        t.savePayload(o, path)
      }

      resolver(o)
      return o
    }

    let complete = (this.done?.indexOf(false) === -1)
    if (complete && this.running) {
      this.running = false
      // @ts-ignore
      let output_ = finish(resolve, payload, this)
      this.triggerEventListener('complete', output_, currentIndex)
    }
    
    return complete
  }

  readPayload(path: string): Payload {
    let s = [
      ReadFile,
      (payload: Payload, parent: ParentPipelineInterface) => {
        try {
          // @ts-ignore
          return JSON.parse(payload.data)
        }
        catch (err) {
          this.error(999999999, 'Can not parse payload', {
            path: path,
            error: err
          })
        }
      }
    ]
    // @ts-ignore
    return new Pipeline(s).process({
      path: path
    })
  }

  savePayload(payload: Payloadable, path?: string) {
    if (!path) {
      path = `${this.name}_${Date.now()}_payload.json`
    }

    let d:writePayload = {
      to: path,
      data: JSON.stringify(payload, null, 2),
      path: path
    }

    WriteFile(d, this).catch((err) => {})
  }
  
  process(payload: Payload, start: number = 0, options?: PipelineOptions): Promise<Payload> {
    this.running = true
    if (options) {
      this.options = options
    }

    this.triggerEventListener('start', payload, start)

    return new Promise(async (resolve, reject) => {
      let stageOutput = await this.triggerHook('filter', payload, -1)
      // let stageOutput = payload
        let index = start
        while (!this.completed(undefined, stageOutput, resolve) && this.running) {
          try {
            this.triggerEventListener('beforeStage', stageOutput, index)
            if (
              this.stageConditions[index] === undefined || 
              // @ts-ignore
              (this.stageConditions[index] && this.stageConditions[index](stageOutput, this))
            ) {
              stageOutput = await this.stages[index](stageOutput, this, index)
            }
            this.triggerEventListener('afterStage', stageOutput, index)
            this.completed(index, stageOutput, resolve)
            index++
          }
          catch (err) {
            reject(this)
          }
        }
        this.completed(undefined, stageOutput, resolve)
      }
    )
  }

  asStage(
    payload: Payload,
    parent?: ParentPipelineInterface,
    index?: number
  ) {
    if (parent) {
      this.parent = parent
    }
    if (index) {
      this.parentIndex = index
    }

    return this.process(payload)
  }

  clone() {
    return new (Object.getPrototypeOf(this).constructor)(
      this.stages, 
      this.options
    )
  }

  parallel(
    payloads: Array<Payload>,
    merger: (toMerge:Array<Payload>, parent: ParentPipelineInterface) => Payload
  ): Promise<Payload> {
    return new Promise((resolve, reject) => {
      let outputs:Array<Payload> = []
      let done: Array<boolean> = []
      let pipelines: Array<MinimalPipelineInterface> = []
      for (let pipelineIndex = 0; pipelineIndex < payloads.length; pipelineIndex++) {
        let payload = payloads[pipelineIndex];
        pipelines.push(this.clone())
        done.push(false)
        pipelines[pipelineIndex].parent = this;
        (pipelines[pipelineIndex].process(payload) as Promise<Payload>).catch((err:any) => {
          this.error(pipelineIndex, 'parallel error', err)
        })
        // @ts-ignore
        .then((newload: Payload) => {
          outputs[pipelineIndex] = newload
          done[pipelineIndex] = true
          let complete = (done.indexOf(false) === -1)
          if (complete) {
            let out_ = merger(outputs, this)
            resolve(out_)
            this.triggerEventListener('complete', out_)
          }
        })
      }
    })
  }
}
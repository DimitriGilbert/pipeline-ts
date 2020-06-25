import { is, isArrayOf } from "ts-type-guards";
import { PipelineOptions, PipelineEventListenerOptions } from ".";
import { LogEntry } from ".";
import { isStage, Stage, StageExecutor, isStageExecutor, MakeStage, StageFilter } from ".";
import { Payload, isPromise, Payloadable } from ".";
import { PipelineEventListener, PipelineEventListenerData } from ".";
import { WriteFile, ReadFile } from "./fs/Stage";
import { writePayload } from "./fs/Payload";

export interface PipeablePipelineInterface {
  asStage: () => Stage
}

export type PipeableBase = Stage | PipeablePipelineInterface | StageExecutor
export type Pipeable = PipeableBase | Array<PipeableBase>
export type PipeableCondition = (payload: Payload, parent: ParentPipelineInterface) => boolean

export function isMinimalPipeline(param: any): param is MinimalPipelineInterface {
  return is(Object)(param) && is(Function)(param.pipe) && is(Function)(param.process)
}

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
  // completed(): boolean
  error(currentIndex: number | undefined, message: string, payload: Payloadable, data?: any): void
  savePayload(payload: Payloadable, path?: string): void
  readPayload(path: string): Payload
}

export interface MinimalPipelineInterface extends ParentPipelineInterface, PipeablePipelineInterface {
  running?: boolean;
  interupted?: boolean;
  errors?: Array<any>;
  pipe(stage: Pipeable, at?: number): this
  process(payload:Payload, start?: number, options?: PipelineOptions): Payload
}

export interface PipelineHasEvent {
  addEventListener: (name: string, event: PipelineEventListener) => boolean
  removeEventListener: (name: string, event: PipelineEventListener) => boolean
  triggerEventListener: (name: string, payload: Payload, index?: number) => Promise<Payload>
}

export function hasEvent (param: any): param is PipelineHasEvent {
  return param 
    && typeof param.addEventListener === "function"
    && typeof param.removeEventListener === "function"
    && typeof param.triggerEventListener === "function"
}

export class PipelineProperties {
  stages: Array<Stage> = []
  stageIndex: number = 0
  status: string = 'empty'
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
    // if (name in PipelineEventList) {
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
      this.log(-1, {
        level: 'vv',
        message: `Adding listeners to event ${name}`,
        data: event
      })
      // @ts-ignore
      this.options.eventListeners[name].push(event)
      return true
    // }
    return false
  }

  removeEventListener(name: string, event: PipelineEventListener): boolean {
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
      this.log(-1, {
        level: 'vv',
        message: `Removing listeners to event ${name}`,
        data: event
      })
      // @ts-ignore
      this.options.eventListeners[name] = [].concat(
        // @ts-ignore
        this.options.eventListeners[name].slice(0, index),
        // @ts-ignore
        this.options.eventListeners[name].slice(index+1)
      )
      return true
    }
    return false
  }

  triggerHook(name: string, payload: Payload, index?: number): Promise<Payload> {
    return new Promise((resolve, reject) => {
      if (
        !this.options.hooks ||
        (this.options.hooks && !this.options.hooks[name])
      ) {
        this.log(-1, {
          level: 'vv',
          message: `No Hook ${name}`
        })
        resolve(payload)
      }
      else {
        this.log(-1, {
          level: 'vv',
          message: `Hook ${name}`,
          data: this.options.hooks[name]
        })
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
          this.log(-1, {
            level: 'vv',
            message: `Hook ${name} Complete`
          })
          // @ts-ignore
          resolve(hookPayload)
        })
      }
    })
  }

  triggerEventListener(name: string, payload?: Payload, index?: number): void {
    this.log(index?index:-1, {
      level: 'vvv',
      message: `Event ${name}`,
      data: payload
    })
    let d: PipelineEventListenerData = {}
    if (payload !== undefined) {
      d.payload = payload
    }
    if (index !== undefined) {
      d.index = index
    }
    if (
      // name in PipelineEventList
      this.options.eventListeners
      // meeeehhhh
      // @ts-ignore
      && this.options.eventListeners[name]
    ) {
      // @ts-ignore
      if (is(Array)(this.options.eventListeners[name])) {
        this.log(index?index:-1, {
          level: 'vv',
          message: `Event ${name} has ${this.options.eventListeners[name].length} listeners`,
          data: payload
        })
        // @ts-ignore
        this.options.eventListeners[name].forEach(
          (evt: PipelineEventListener) => {
            evt(this, d)
          }
        )
      }
      else {
        this.log(index?index:-1, {
          level: 'vv',
          message: `Event ${name} has 1 listener`,
          data: payload
        })
        // @ts-ignore
        this.options.eventListeners[name](this, d)
      }
    }
    if (hasEvent(this.parent)) {
      this.parent.triggerEventListener(`stage_${name}`, d, this.parentIndex)
    }
  }

  pipe(stage: Pipeable, at?: number): this {
    this.triggerEventListener('pipe', {stage: stage})

    if (isPipes(stage)) {
      stage.forEach((s) => {
        this.pipe(s, at)
        if (at !== undefined) {
          at++
        }
      })
    }
    
    if (isPipeablePipeline(stage)) {
      stage = stage.asStage()
    }

    if (isStage(stage)) {
      this.addStage(stage, at)
    }

    if (isStageExecutor(stage)) {
      this.addStage({
        executor:stage,
        done: false,
        running:false
      }, at)
    }

    return this
  }

  addStage(stage: Stage, at?: number): this {
    if (at === undefined) {
      this.stages.push(stage)
    }
    else {
      let stages = this.stages
      this.stages = stages.slice(0, at)
      this.stages.push(stage)
      this.stages.concat(stages.slice(at))
    }
    if (this.status === 'empty') {
      this.status = 'staged'
    }
    if (!stage.status) {
      stage.status = 'ready'
    }
    this.triggerEventListener('addStage', {stage: stage})
    return this
  }

  runStage(payload: Payload, index?: number): Promise<Payload> {
    return new Promise((resolve, reject) => {
      if (index === undefined) {
        index = this.stageIndex
      }
      
      if (!isPromise(payload)) {
        this.stages[index].status = 'running'
        this.stages[index].running = true
        this.triggerEventListener('beforeStage', payload, index)
        let stagePayload = payload
        let stage = this.stages[index]
        if (stage.filter && stage.filter.in) {
          stagePayload = stage.filter.in(payload)
        }
        let nextload = stage.executor(stagePayload, this, index)
        resolve(nextload)
      }
      else {
        let i = index
        payload.then((stageLoad) => {
          let nextLoad = this.runStage(stageLoad, i)
          resolve(nextLoad)
        }).catch((err) => {
          this.error(i, 'previous stage error', err)
          reject(err)
        })
      }
    })
  }

  completeStage(payload: Payload, status: string = 'done', eventName: string = 'afterStage') {
    this.stages[this.stageIndex].status = status
    this.stages[this.stageIndex].running = false
    this.stages[this.stageIndex].done = true
    this.triggerEventListener(eventName, payload, this.stageIndex)
    this.stageIndex++
  }

  complete(payload: Payload, status: string = 'done', eventName: string = 'done') {
    this.running = false
    this.status = status
    this.triggerEventListener(eventName, payload, this.stageIndex)
  }

  output(payload: Payload, status: string = 'completed', eventName: string = 'completed') {
    return new Promise((resolve, reject) => {
      this.triggerHook('output', payload).then((outputLoad) => {
        if (this.options?.output?.save) {
          let path
          if (typeof this.options.output.save === "string") {
            path = this.options.output.save
          }
          this.savePayload(outputLoad, path)
        }
        this.status = status
        this.triggerEventListener(eventName, outputLoad, this.stageIndex)
        resolve(outputLoad)
      }).catch((err) => {
        this.error(this.stageIndex, 'output hook error', err)
      })
    })
  }

  stageLoop(payload: Payload): Promise<Payload> {
    return new Promise((resolve, reject) => {
      if (this.running && this.stages[this.stageIndex].status === 'ready') {
        this.triggerEventListener('readyStage', payload, this.stageIndex)
        let skip = false
        let stg = this.stages[this.stageIndex]
        if (stg.condition) {
          skip = !stg.condition(payload, this)
        }
        if (!skip) {
          this.runStage(payload)
            .then((nextLoad) => {
              let completeLoad = nextLoad
              if (stg.filter && stg.filter.out) {
                completeLoad = stg.filter.out(nextLoad, payload)
              }
              this.completeStage(completeLoad)
              if (this.stageIndex >= this.stages.length) {
                this.complete(completeLoad)
                resolve(this.output(completeLoad))
              }
              else {
                resolve(this.stageLoop(completeLoad))
              }
            })
            .catch((err) => {
              this.error(this.stageIndex, 'stage error', err)
              reject(err)                    
            })
        }
        else {
          this.completeStage(payload, 'skiped', 'stageSkiped')
        }
      }
    })
  }

  log(currentIndex: number, log: LogEntry): void {
    if (this.options.log?.keep) {
      log.index = currentIndex
      this.logs.push(log)
    }

    // this.triggerEventListener('log', log, currentIndex)
    
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

  readPayload(path: string): Payload {
    let s = [
      ReadFile,
      (payload: Payload, parent: ParentPipelineInterface) => {
        try {
          this.triggerEventListener('readPayload', payload)
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

    WriteFile(d, this).catch((err) => {}).then((data) => {
      this.triggerEventListener('savedPayload', payload)
    })
  }
  
  process(payload: Payload, start: number = 0, options?: PipelineOptions): Promise<Payload> {
    return new Promise((resolve, reject) => {
        this.running = true
        this.status = 'running'
        if (options) {
          this.options = options
        }
        this.triggerEventListener('start', payload, start)
        this.triggerHook('filter', payload, -1).then((filteredLoad) => {
          this.triggerEventListener('filtered', filteredLoad, start)
          this.stageIndex = start
          this.stageLoop(filteredLoad).then((processedLoad) => {
            resolve(processedLoad)
          }).catch((err) => {
            console.log(err)
          })
        }).catch((err) => {
          console.log(err)
        })
      }
    )
  }

  asStage(
    condition?: PipeableCondition,
    filter?: StageFilter
  ): Stage {
    this.triggerEventListener('asStage')
    return MakeStage((
        payload: Payload,
        parent?: ParentPipelineInterface,
        index?: number
      ) => {
        return this.asExecutor(
          payload,
          parent,
          index
        )
      },
      this.name,
      condition,
      filter
    )
  }

  asExecutor(
    payload: Payload,
    parent?: ParentPipelineInterface,
    index?: number
  ) {
    this.triggerEventListener('asExecutor')
    if (parent) {
      this.parent = parent
    }
    if (index) {
      this.parentIndex = index
    }

    return this.process(payload)
  }

  clone() {
    this.triggerEventListener('clone')
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
      this.triggerEventListener('parrallel', payloads)
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
          this.triggerEventListener('parrallelPartComplete', outputs[pipelineIndex], pipelineIndex)
          let complete = (done.indexOf(false) === -1)
          if (complete) {
            let out_ = merger(outputs, this)
            resolve(out_)
            this.triggerEventListener('parrallelComplete', out_)
          }
        })
      }
    })
  }
}
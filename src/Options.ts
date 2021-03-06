import { LogLevels } from "."
import { PipelineEventListener } from "."
import { Payload } from "."
import { Pipeable } from "."

export type LogOptions = {
  keep?: boolean
  level?: typeof LogLevels[number]
  saveFile?: string
}

export type parallelOptions = {
  on?: string,
  with?: string | Array<string>
}

export type payloadCleanerFunc = (payload: Payload) => Payload

export type payloadCleaner =  string | payloadCleanerFunc

export type outputOptions = {
  wrapper?: string
  clean?: payloadCleaner | Array<payloadCleaner>
  save?: string | boolean
}

export type hookOptions = {
  pipeable: Pipeable
  options?: PipelineOptions
}

export type PipelineEventListenerOptions = {
  [key: string]: PipelineEventListener | Array<PipelineEventListener>
}

export type PipelineOptions = {
  // [key: string]: any
  log?: LogOptions
  parallel?: parallelOptions | boolean
  failOnInterruption?: boolean
  eventListeners?: PipelineEventListenerOptions
  output?: outputOptions
  hooks?: {
    [key: string]: hookOptions
  }
}
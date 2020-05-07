
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { writePayload } from "../fs/Payload";
import { Payload } from "../Payload";
import { PipelineOptions } from "../Options";

export type RequestPayload = {
  request: AxiosRequestConfig,
  response?: AxiosResponse
} & Payload

export type DownloadPayload = {
  pipelineOptions?: PipelineOptions
} & writePayload & RequestPayload
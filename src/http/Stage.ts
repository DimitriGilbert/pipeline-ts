import axios from "axios";
import { RequestPayload, DownloadPayload } from "./Payload";
import { ParentPipelineInterface, Pipeline } from "../";
import { writePayload } from "../fs/Payload";
import { WriteFile } from "../fs/Stage";

export async function httpRequest(
  payload: RequestPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    if (!payload.request.method) {
      payload.request.method = 'get'
    }
    axios.request(payload.request).then((res) => {
      payload.response = res
      resolve(res)
    }).catch((err) => {
      reject(err)
      parent?.error(index, 'http error', payload, err)
    })
  });
}

export async function download(
  payload: DownloadPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  function resp2data(pl: DownloadPayload & writePayload ) {
    payload.data = payload.response?.data
    return payload
  }
  let stages = [
    httpRequest,
    resp2data,
    WriteFile
  ]
  let p = new Pipeline()
  // @ts-ignore
  p.pipe(stages)
  return p.asExecutor(payload, parent, index)
}

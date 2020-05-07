import axios from "axios";
import { RequestPayload, DownloadPayload } from "./Payload";
import { ParentPipelineInterface, Pipeline } from "../Pipeline";
import { writePayload } from "../fs/Payload";
import { WriteFile } from "../fs/Stage";

export async function httpRequest(
  payload: RequestPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
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
  // @ts-ignore
  let p = new Pipeline(stages, payload.pipelineOptions)
  return p.asStage(payload, parent, index)
}

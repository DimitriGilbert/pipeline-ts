import axios from "axios";
import { RequestPayload } from "./Payload";
import { ParentPipelineInterface } from "../Pipeline";
import { Payload } from "../Payload";

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

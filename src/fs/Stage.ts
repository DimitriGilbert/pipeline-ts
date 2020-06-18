import * as fs from "fs";
// import * as readdirRecursive from "fs-readdir-recursive";

import { ParentPipelineInterface } from "../Pipeline";
import { readPayload, FsPayload, writePayload, writeOperationPayload, mkdirPayload, copyPayload } from "./Payload";

export async function PathExists(
  payload: FsPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    if (payload.path) {
      fs.access(payload.path, (err) => {
        if (err) {
          reject(err)
          parent?.error(index, 'fs access error', payload, err)
        }
        else {
          resolve(payload)
        }
      })
    }
    else {
      let err = {needInput: "path"}
      reject(err)
      parent?.error(index, 'path missing', payload, err)
    }
  });
}

export function ReadFile(
  payload: readPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    fs.readFile(payload.path, (err, data) => {
      if (err) {
        parent?.error(index, 'fs read error', payload, err)
        reject(err)
      }
      else {
        let output: string | Buffer = data
        if (payload.asBuffer !== true) {
          output = output.toString()
        }
        if (payload.sanitize) {
          output = payload.sanitize(output)
        }
        resolve(Object.assign(payload, {data: output}))
      }
    })
  });
}

export function WriteFile(
  payload: writePayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    let output: writeOperationPayload = {
      type: "write",
      length:payload.data.length,
      path: payload.to,
      data: payload.data
    }
    if (payload.sanitizeTo) {
      // @ts-ignore
      output.data = payload.sanitizeTo(output.data)
    }

    fs.writeFile(payload.to, output.data, (err) => {
      if (err) {
        parent?.error(index, 'fs write error', payload, err)
        reject(err)
      }
      else {
        resolve(Object.assign(payload, {data: output}))
      }
    })
  });
}

export function Copy(
  payload: copyPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    fs.copyFile(payload.path, payload.to, (err) => {
      if (err) {
        parent?.error(index, 'fs copy error', payload, err)
        reject(err)
      }
      else {
        resolve(payload)
      }
    })
  });
}

export function BakFile (
  payload: copyPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    let bak = payload.bak
    if (!bak || bak === true) {
      bak = ".bak"
    }
    fs.copyFile(payload.path, payload.path+bak, (err) => {
      if (err) {
        parent?.error(index, 'fs Bak error', payload, err)
        reject(err)
      }
      else {
        resolve(payload)
      }
    })
  });
}

export function MkDir(
  payload: mkdirPayload,
  parent?: ParentPipelineInterface,
  index?: number
) {
  return new Promise((resolve, reject) => {
    let r = true
    if (payload.noRecursive) {
      r =  false
    }
    fs.mkdir(payload.path, {
      recursive: r
    }, (err) => {
      if (err) {
        parent?.error(index, 'fs mkdir error', payload, err)
        reject(err)
      }
      else {
        resolve(payload)
      }
    })
  });
}

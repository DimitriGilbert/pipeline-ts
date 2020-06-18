# pipeline-ts #

* A simply rough pipeline implementation in Typescript
* 0.0.1alpha-dev

## Install ##

### Npm ###

```bash
npm i DimitriGilbert/pipeline-ts [--save]
```

## Usage ##

Everything that takes a payload as parameter is called an executor and can be piped in a pipeline,
you can also pipe a pipeline instead of an executor,
hell, you can even pipe arrays of executors, or pipelines, or both !
What if you need more controle over your stage add a execution condition or filter the payload ?
you can do that using the stage object !

### Typescript ###

#### Basic ####

```typescript
import * as pipelineTs from 'DimitriGilbert/pipiline-ts'

// create en executor
let executor: pipelineTs.Stage.StageExecutor = (
  payload: pipelineTs.Payload.Payload,
  parent?: pipelineTs.Pipeline.ParentPipelineInterface,
  index?: number
): pipelineTs.Payload.Payload => {
  payload.myData = {
    message: "some new data in the payload"
  }
  return payload
}

let executorPromised: pipelineTs.Stage.StageExecutor = (
  payload: pipelineTs.Payload.Payload,
  parent?: pipelineTs.Pipeline.ParentPipelineInterface,
  index?: number
): Promise<pipelineTs.Payload.Payload> => {
  return new Promise((resolve, reject) => {
    payload.myPromisedData = {
      message: "promised data"
    }
    resolve(payload)
  })
}

// your starting payload
let myPayload: pipelineTs.Payload.Payload = {}

// create a pipeline
let pipeline = new pipelineTs.Pipeline.Pipeline()

// pipe executors
pipeline.pipe(executor)
pipeline.pipe(executorPromised)

// process your payload with the pipeline
pipeline.process(myPayload).then((processedPayload) => {
  // do something with your payload
  console.log(processedPayload)
}).catch((err) => {
  // or maybe something went wrong
  console.error(err)
})
```

## Contribution guidelines ##

If you really want to you can :

* Write tests
* Review code
* Submit idea to improve quality/functionality (PR welcomed)

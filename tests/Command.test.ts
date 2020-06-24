import { Container, isContainer, isContainerEntry, isContainerPipeableEntry, isPipeable, Command, Payloadable } from "../src"
import { basic, long, promised } from "./stage"

describe('Container', () => {
  it('creates', () => {
    let command = new Command(new Container())
    expect(command).toBeDefined()
    expect(command.container).toBeDefined()
  }),
  it('parses args', () => {
    let container = new Container()
    container.set('basic', basic)
    container.set('long', long)
    let command = new Command(container)
    command.parseArgs([
      "basic",
      "long",
      "--plop=plouf",
      "--plouf=PLOUF"
    ])
    expect(command.payload).toBeDefined()
    expect(command.payload.plop).toBeDefined()
    expect(command.payload.plouf).toBeDefined()
    expect(command.payload.plop).toBe("plouf")
    expect(command.payload.plouf).toBe("PLOUF")
  }),
  it('processes', () => {
    let container = new Container()
    container.set('basic', basic)
    container.set('long', long)
    container.set('promised', promised)
    let command = new Command(container, [
      "basic",
      "long",
      "--plop=plouf",
      "--plouf=PLOUF",
      "--pipelineStages=promised"
    ])
    let proc = command.process()
    expect(proc).toBeDefined()
    proc.then((payload) => {
      expect(payload).toHaveProperty("plop")
      expect(payload).toHaveProperty("plouf")
    })
  })
})
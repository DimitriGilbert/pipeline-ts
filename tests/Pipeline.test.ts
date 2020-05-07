import {Pipeline} from "../src";
import { basic, promised, long } from "./stage";

describe('Pipeline', () => {
  it('creates', () => {
    let p = new Pipeline()
    expect(p.running).toBe(false)
  }),
  it('pipes', () => {
    let p = new Pipeline()
    p.pipe(basic)
    expect(p.stages.length).toBe(1)
    expect(p.done?.length).toBe(1)
    // @ts-ignore
    expect(p.done[0]).toBe(false)
    p.pipe([promised, long])
    expect(p.stages.length).toBe(3)
    // @ts-ignore
    expect(p.done[0]).toBe(false)
  }),
  it('processes', () => {
    let p = new Pipeline([
      basic,
      promised,
      long
    ])
    expect(p.stages.length).toBe(3)
    p.process({}).then((payload) => {
      expect(p.running).toBe(false)
      // @ts-ignore
      expect(p.done[0]).toBe(true)
    })
    expect(p.running).toBe(true)
  })
})

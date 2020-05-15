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
    
    p.pipe([promised, long])
    expect(p.stages.length).toBe(3)
    
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
      
    })
    expect(p.running).toBe(true)
  })
})

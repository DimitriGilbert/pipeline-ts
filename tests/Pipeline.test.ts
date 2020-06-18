import {Pipeline, MakeStage} from "../src";
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
  }),
  it('runs condition on stages', () => {
    let stg = MakeStage((payload) => {
      return payload
    }, "withCondition", (payload) => {
      expect(true).toBe(true)
      return true
    })
    let noStg = MakeStage((payload) => {
      expect(true).toBe(false)
      return payload
    }, "withRejectCondition", (payload) => {
      expect(false).toBe(false)
      return false
    })
    let p = new Pipeline([
      basic,
      promised,
      stg,
      noStg,
      long
    ])
    p.process({}).then((payload) => {
      expect(p.running).toBe(false)
    })
  }),
  it('runs filter on stages', () => {
    let inStg = MakeStage((payload) => {
      expect(payload.inFilterData).not.toBeUndefined()
      expect(payload.inFilterData.someData).toBe(0)
      expect(payload.inFilterData.moreData).toBe(true)
      return payload
    }, "withFilterIn", undefined, {
      in: (payload) => {
        expect(true).toBe(true)
        payload.inFilterData = {
          someData: 0,
          moreData: true
        }
        return payload
      }
    })
    let outStg = MakeStage((payload) => {
      expect(payload.inFilterData).not.toBeUndefined()
      expect(payload.inFilterData.someData).toBe(0)
      expect(payload.inFilterData.moreData).toBe(true)
      return payload
    }, "withFilterOut", undefined, {
      out: (payload) => {
        expect(true).toBe(true)
        payload.outFilterData = {
          someOutData: 0,
          moreOutData: true
        }
        return payload
      }
    })
    let inOutStg = MakeStage((payload) => {
      expect(payload.outFilterData).not.toBeUndefined()
      expect(payload.outFilterData.someOutData).toBe(0)
      expect(payload.outFilterData.moreOutData).toBe(true)
      expect(payload.inFilterData).toBeUndefined()
      expect(payload.newInFilterData).not.toBeUndefined()
      expect(payload.newInFilterData.newData).toBe(true)
      expect(payload.newInFilterData.Daaaaaaaataaaaa).toBe(42)
      return payload
    }, "withFilterInOut", undefined, {
      in: (payload) => {
        expect(true).toBe(true)
        payload = Object.assign(payload, {inFilterData: undefined})
        payload.newInFilterData = {
          newData: true,
          Daaaaaaaataaaaa: 42
        }
        return payload
      },
      out: (payload) => {
        expect(true).toBe(true)
        payload.MoreOutFilterData = {
          someMoreOutData: 0,
          moreMoreOutData: true
        }
        return payload
      }
    })
    let p = new Pipeline([
      basic,
      promised,
      inStg,
      outStg,
      inOutStg,
      MakeStage((pl) => {
        expect(pl.MoreOutFilterData).not.toBeUndefined()
        expect(pl.MoreOutFilterData.someMoreOutData).toBe(0)
        expect(pl.MoreOutFilterData.moreMoreOutData).toBe(true)
        return pl
      }),
      long
    ])
    p.process({}).then((payload) => {
      expect(p.running).toBe(false)
    })
  })
})

import { Container, isContainer, isContainerEntry, isContainerPipeableEntry, isPipeable } from "../src"
import { basic, long } from "./stage"

describe('Container', () => {
  it('creates', () => {
    let container = new Container()
    expect(container).toBeDefined()
    expect(isContainer(container)).toBe(true)
  }),
  it('sets and has', () => {
    let container = new Container()
    expect(container.has('nonExistant')).toBe(false)
    expect(container.set('basic', basic)).toHaveProperty('entries')
    expect(container.has('basic')).toBe(true)
    expect(container.has('basic', 'pipeable')).toBe(true)
    expect(container.has('basic', 'container')).toBe(false)
    expect(container.has('basic', 'instantiable')).toBe(false)
    container.set('subContainer', new Container())
    expect(container.has('subContainer')).toBe(true)
    container.set('subContainer.long',long)
    expect(container.has('subContainer.long')).toBe(true)
  }),
  it('gets', () => {
    let container = new Container()
    container.set('basic', basic)
    let basicEntry = container.get('basic')
    expect(isContainerEntry(basicEntry)).toBe(true)
    expect(isContainerPipeableEntry(basicEntry)).toBe(true)
    expect(basicEntry.pipeable).toBeDefined()
    expect(basicEntry.pipeable).toEqual(basic)
    let basicIns = container.getInstance('basic')
    expect(isPipeable(basicIns)).toBe(true)
    expect(basicIns).toEqual(basic)
    container.set('subContainer', new Container())
    container.set('subContainer.long',long)
    let longEntry = container.get('subContainer.long')
    expect(isContainerEntry(longEntry)).toBe(true)
    expect(isContainerPipeableEntry(longEntry)).toBe(true)
    expect(longEntry.pipeable).toEqual(long)
  })
})
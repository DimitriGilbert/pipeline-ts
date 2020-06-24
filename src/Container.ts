import { Pipeable, isPipeable } from "."

export type Containerable = Pipeable | ContainerPipeableEntry | ContainerContainerEntry | ContainerInstanciableEntry

export type ContainerBaseEntry = {
  name: string,
  expects?: any,
  provides?: any
  factory?: (() => Pipeable) | boolean,
  pipeable?: Pipeable,
  container?: Container
}

export type ContainerPipeableEntry = {
  pipeable: Pipeable
} & ContainerBaseEntry

export type ContainerContainerEntry = {
  container: Container
} & ContainerBaseEntry

export type ContainerInstanciableEntry = {
  factory: () => Pipeable
} & ContainerBaseEntry

export type ContainerEntry = ContainerPipeableEntry | ContainerContainerEntry

export type ContainerEntries = {
  [key: string]: ContainerEntry
}

export function isContainerPipeableEntry (param: any): param is ContainerPipeableEntry {
  return param && param.hasOwnProperty('name') && param.hasOwnProperty('pipeable')
}

export function isContainerContainerEntry (param: any): param is ContainerContainerEntry {
  return param && param.hasOwnProperty('name')
    && param.hasOwnProperty('container')
    && isContainer(param.container)
}

export function isContainerEntry (param: any): param is ContainerEntry {
  return isContainerPipeableEntry(param) || isContainerContainerEntry(param)
}

export function isContainerInstanciableEntry (param: any): param is ContainerInstanciableEntry {
  return isContainerEntry(param)
    && param.hasOwnProperty('factory')
    && (typeof param.factory === "function" || typeof param.factory === "boolean")
}

export function isContainer (param: any): param is Container {
  return param
    && param.hasOwnProperty('entries')
    && typeof param.has === "function"
    && typeof param.get === "function"
    && typeof param.set === "function"
}

export class Container {
  entries?: ContainerEntries

  constructor(entries?: ContainerEntries) {
    if (entries) {
      this.entries = entries
    }
  }

  has(name: string, check?: string | Array<string>): boolean {
    let fqn = name.split(".")
    if (fqn.length >= 1) {
      let entryName = fqn[0]
      if (this.entries?.hasOwnProperty(entryName)) {
        if (fqn.length > 1) {
          let entry = this.entries[entryName]
          if (!isContainerContainerEntry(entry)) {
            return false
          }
          return entry.container.has(fqn.slice(1).join("."), check)
        }
        if (typeof check === "string") {
          check = [check]
        }
        let ret = true
        if (check) {
          if (ret && check.indexOf("container") !== -1) {
            ret = isContainerContainerEntry(this.entries[entryName])
          }
          if (ret && check.indexOf("pipeable") !== -1) {
            ret = isContainerPipeableEntry(this.entries[entryName])
          }
          if (ret && check.indexOf("instantiable") !== -1) {
            ret = isContainerInstanciableEntry(this.entries[entryName])
          }
          console.log(name, ret)
        }
        return ret
      }
    }
    
    return false
  }

  set(name: string, content: Pipeable | Container, expects?: any, provides?: any): this {
    let fqn = name.split(".")
    if (fqn.length >= 1) {
      if (!this.entries) {
        this.entries = {}
      }
      let entryName = fqn[0]
      if (this.entries.hasOwnProperty(entryName)) {
        if (fqn.length > 1) {
          let entry = this.entries[entryName]
          if (isContainerContainerEntry(entry)) {
            try {
              return this.set(
                entryName,
                entry.container.set(fqn.slice(1).join("."), content, expects, provides)
              )
            }
            catch (err) {
              throw new Error(entryName +"."+ err.message)
            }
          }
          throw new Error(entryName + " is not a container, cannot reach "+name)
        }
      }
      let nEntry: ContainerBaseEntry = {
        name: entryName
      }
      if (isPipeable(content)) {
        nEntry.pipeable = content
      }
      else if (isContainer(content)) {
        nEntry.container = content
      }
  
      if (expects) {
        nEntry.expects = expects
      }
      if (provides) {
        nEntry.provides = provides
      }
      if (isContainerEntry(nEntry)) {
        this.entries[entryName] = nEntry
      }
  
      return this
    }
    throw new Error(name + " is not a valid path ")
  }

  get(name: string, check?: string | Array<string>): ContainerEntry {
    if (this.has(name, check)) {
      let fqn = name.split(".")
      if (fqn.length >= 1) {
        let entryName = fqn[0]
        if (this.entries?.hasOwnProperty(entryName)) {
          if (fqn.length > 1) {
            let entry = this.entries[entryName]
            if (isContainerContainerEntry(entry)) {
              try {
                return entry.container.get(fqn.slice(1).join("."))
              }
              catch (err) {
                throw new Error(entryName +"."+ err.message)
              }
            }
            throw new Error(entryName + " is not a container, cannot reach "+name)
          }
          return this.entries[entryName]
        }
      }
    }
    throw new Error("Unknown Entry "+name)
  }

  getInstance(name: string): Pipeable {
    if (this.has(name)) {
      let pipeOrInstanciable = this.get(name)
      if (isContainerInstanciableEntry(pipeOrInstanciable)) {
        return pipeOrInstanciable.factory()
      }
      else if (isContainerPipeableEntry(pipeOrInstanciable)) {
        return pipeOrInstanciable.pipeable
      }
    }
    throw new Error(name+" is neither instanciable nor a pipepable")
  }
}
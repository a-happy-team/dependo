export type Clazz = new (...args: any[]) => any

export class Container {
  private static instance: Container
  private nameToClazz: Map<string, { singleton?: boolean; clazz: Clazz}> = new Map();
  private nameToInstance: Map<string, InstanceType<Clazz>> = new Map();
  
  private constructor() {}
  public static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  public register(clazz: Clazz, singleton = false) {
    if (this.nameToClazz.has(clazz.name)) {
      throw new Error(`WARNING: Class with name ${clazz.name} is already registered`)
    }

    this.nameToClazz.set(clazz.name, { singleton, clazz })
  }

  public resolve<T extends Clazz>(clazz: T): InstanceType<T> {
    if (this.nameToInstance.has(clazz.name)) {
      return this.nameToInstance.get(clazz.name) as InstanceType<T>
    }

    const storedClazz = this.nameToClazz.get(clazz.name)

    if (!storedClazz) {
      throw new Error(`Class with name ${clazz.name} is not registered`)
    }

    const instance = new storedClazz.clazz

    if (storedClazz.singleton) {
      this.nameToInstance.set(clazz.name, instance)
    }

    return instance
  }

  dispose() {
    this.nameToInstance.clear()
    this.nameToClazz.clear()
  }
}

// Injectable -> register
// Inject -> resolve
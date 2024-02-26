export type Token = Class | string

export type Class = new (...args: any[]) => any
export type ResolvedValue = string | number | boolean | InstanceType<Class>

export type ValueToBeResolved = Factory | Class | ResolvedValue

export type Factory = () => ResolvedValue

export class Container {
  private static instance: Container
  private tokenToValue: Map<string, { singleton?: boolean; value: ValueToBeResolved }> = new Map();
  private tokenToResolved: Map<string, ResolvedValue> = new Map();
  
  private constructor() {}
  public static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }


  public resolve<T extends Token>(token: T): ResolvedValue {
    let parsedToken: string = typeof token === 'string' ? token : token.name

    if (this.tokenToResolved.has(parsedToken)) {
      return this.tokenToResolved.get(parsedToken) as ResolvedValue
    }

    const storedValue = this.tokenToValue.get(parsedToken)

    if (!storedValue) {
      throw new Error(`No value found for token ${parsedToken}`)
    }

    let instance: ResolvedValue = storedValue.value

    if (this.isClass(storedValue.value)) {
      instance = new storedValue.value
    }

    if (this.isFactory(storedValue.value)) {
      instance = storedValue.value()
    }

    if (storedValue.singleton) {
      this.tokenToResolved.set(parsedToken, instance)
    }

    return instance
  }

  public register<T extends Class>(clazz: T, value: T, singleton: boolean): void
  public register<T extends ResolvedValue>(token: string, value: T, singleton: boolean): void
  public register<T extends Factory>(token: string, value: T, singleton: boolean): void
  public register<T extends Class | ResolvedValue | Factory>(token: string, value: T, singleton = false) {
    if (this.isClass(token)) {
      return this.registerClass(token, singleton)
    }
    
    if (this.isFactory(value)) {
      return this.registerFactory(token, value, singleton)
    }

    return this.registerValue(token, value)
  }

  private registerClass(clazz: Class, singleton = false) {
    if (this.tokenToValue.has(clazz.name)) {
      throw new Error(`Class with name ${clazz.name} is already registered`)
    }

    this.tokenToValue.set(clazz.name, { singleton, value: clazz })
  }

  private registerValue<T>(name: string, value: T) {
    this.tokenToResolved.set(name, value)
  }

  private registerFactory<T>(name: string, factory: () => T, singleton = false) {
    this.tokenToResolved.set(name, factory())
  }

  dispose() {
    this.tokenToResolved.clear()
    this.tokenToValue.clear()
  }

  private isClass(value: any): value is Class {
    return typeof value === 'function' && Object.getOwnPropertyNames(value).includes('prototype')
  }

  private isFactory(value: any): value is Factory {
    return typeof value === 'function' && !this.isClass(value)
  }
}

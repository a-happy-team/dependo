import { Class, Container } from "../container"

export const inject = (clazz: Class) => {
  return (_: unknown, context: ClassFieldDecoratorContext) => {
    if (context.kind !== 'field') {
      throw new Error('@inject can only be used on a class property')
    }

    const container = Container.getInstance()

    return () => container.resolve(clazz)
  }
}
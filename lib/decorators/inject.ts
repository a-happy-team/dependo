import { Class, Container } from "../container"

export const inject = (token: Class | string) => {
  return (_: unknown, context: ClassFieldDecoratorContext) => {
    if (context.kind !== 'field') {
      throw new Error('@inject can only be used on a class property')
    }

    const container = Container.getInstance()

    return () => container.resolve(token)
  }
}
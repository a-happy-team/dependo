
import { Clazz, Container } from "../container"

export function singleton (target: Function, context: ClassDecoratorContext) {
    if (context.kind !== 'class') {
      throw new Error('@injectable can only be used on a class')
    }

    const container = Container.getInstance()

    container.register(target as Clazz, true)
  }
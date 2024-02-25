import { Class, Container } from "../container"

type InjectableParams = {
  singleton?: boolean
}
export function injectable (params?: InjectableParams) {

  return function (target: Function, context: ClassDecoratorContext) {
    if (context.kind !== 'class') {
      throw new Error('@injectable can only be used on a class')
    }

    const container = Container.getInstance()

    container.register(target as Class, target as Class, params?.singleton ?? false)
  }
}


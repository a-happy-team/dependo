import assert from 'node:assert'
import test from 'node:test'
import { container, inject, injectable, singleton } from '../lib'
import { Container } from '../lib/container'

test('should instantiate container correctly', (t) => {
  assert.strictEqual(container instanceof Container, true)  
})

test('should register class correctly', (t) => {
  class TestClass0 {}
  container.register(TestClass0)
  assert.strictEqual(container['nameToClazz'].has('TestClass0'), true)
})

test('should register class using decorator correctly', (t) => {
  @injectable
  class TestClass00 {}
  assert.strictEqual(container['nameToClazz'].has('TestClass00'), true)
})

test('should register a class as a singleton correctly', (t) => {
  @singleton
  class TestClass1 {}
  assert.strictEqual(container['nameToClazz'].get('TestClass1')?.singleton
    , true)
})

test('should resolve class correctly', (t) => {
  @injectable
  class TestClass2 {}
  const instance = container.resolve(TestClass2)
  assert.strictEqual(instance instanceof TestClass2, true)
})

test('should resolve class as a singleton correctly', (t) => {
  @singleton
  class TestClass3 {}
  const instance = container.resolve(TestClass3)
  const instance2 = container.resolve(TestClass3)
  assert.strictEqual(instance, instance2)
})

test('should throw error when resolving unregistered class', (t) => {
  class TestClass4 {}
  assert.throws(() => container.resolve(TestClass4))
})

test('should throw error when registering class with same name', (t) => {
  class TestClass5 {}
  container.register(TestClass5)
  assert.throws(() => container.register(TestClass5))
})

test('should dispose container correctly', (t) => {
  class TestClass6 {}
  container.register(TestClass6)
  container.dispose()
  assert.strictEqual(container['nameToClazz'].size, 0)
  assert.strictEqual(container['nameToInstance'].size, 0)
})

test('should resolve class with dependencies correctly', (t) => {
  @injectable
  class TestClass7 {}
  @injectable
  class TestClass8 {
    @inject(TestClass7) testClass7: TestClass7
  }
  const instance = container.resolve(TestClass8)
  assert.strictEqual(instance.testClass7 instanceof TestClass7, true)
})

test('should resolve class with dependencies as singletons correctly', (t) => {
  @singleton
  class TestClass9 {}
  @injectable
  class TestClass10 {
    @inject(TestClass9) testClass9: TestClass9
  }
  const instance = container.resolve(TestClass10)
  const instance2 = container.resolve(TestClass10)
  assert.strictEqual(instance.testClass9, instance2.testClass9)
})

test('should resolve class with lots of dependencies correctly', (t) => {
  @singleton
  class TestClass11 {}
  @injectable
  class TestClass12 {
    @inject(TestClass11) testClass11: TestClass11
  }
  @injectable
  class TestClass13 {
    @inject(TestClass12) testClass12: TestClass12
  }
  @injectable
  class TestClass14 {
    @inject(TestClass13) testClass13: TestClass13
  }
  @injectable
  class TestClass15 {
    @inject(TestClass14) testClass14: TestClass14
  }

  @injectable
  class TestClass16 {
    @inject(TestClass15) testClass15: TestClass15
    @inject(TestClass14) testClass14: TestClass14
    @inject(TestClass13) testClass13: TestClass13
    @inject(TestClass12) testClass12: TestClass12
    @inject(TestClass11) testClass11: TestClass11
  }

  const instance = container.resolve(TestClass15)
  assert.strictEqual(instance.testClass14.testClass13.testClass12.testClass11 instanceof TestClass11, true)
  
  const instance2 = container.resolve(TestClass16)

  assert.strictEqual(instance2 instanceof TestClass16, true)
})
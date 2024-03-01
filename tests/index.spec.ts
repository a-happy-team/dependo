import assert from "node:assert";
import test from "node:test";
import { container, inject, injectable } from "../lib";
import { Container } from "../lib/container";

test("should instantiate container correctly", (t) => {
	assert.strictEqual(container instanceof Container, true);
});

test("should register class correctly", (t) => {
	class TestClass0 {}
	container.register(TestClass0, TestClass0, false);
	console.log(container["tokenToValue"]);
	assert.strictEqual(container["tokenToValue"].has("TestClass0"), true);
});

test("should register class using decorator correctly", (t) => {
	@injectable()
	class TestClass00 {}
	assert.strictEqual(container["tokenToValue"].has("TestClass00"), true);
});

test("should register a class as a singleton correctly", (t) => {
	@injectable({ singleton: true })
	class TestClass1 {}
	assert.strictEqual(
		container["tokenToValue"].get("TestClass1")?.singleton,
		true,
	);
});

test("should resolve class correctly", (t) => {
	@injectable()
	class TestClass2 {}
	const instance = container.resolve(TestClass2);
	assert.strictEqual(instance instanceof TestClass2, true);
});

test("should resolve class as a singleton correctly", (t) => {
	@injectable({ singleton: true })
	class TestClass3 {}
	const instance = container.resolve(TestClass3);
	const instance2 = container.resolve(TestClass3);
	assert.strictEqual(instance, instance2);
});

test("should throw error when resolving unregistered class", (t) => {
	class TestClass4 {}
	assert.throws(() => container.resolve(TestClass4));
});

test("should dispose container correctly", (t) => {
	class TestClass6 {}
	container.register(TestClass6, TestClass6, false);
	container.dispose();
	assert.strictEqual(container["tokenToValue"].size, 0);
	assert.strictEqual(container["tokenToResolved"].size, 0);
});

test("should resolve class with dependencies correctly", (t) => {
	@injectable()
	class TestClass7 {}
	@injectable()
	class TestClass8 {
		@inject(TestClass7) testClass7: TestClass7;
	}
	const instance = container.resolve(TestClass8);
	assert.strictEqual(instance.testClass7 instanceof TestClass7, true);
});

test("should resolve class with dependencies as singletons correctly", (t) => {
	@injectable({ singleton: true })
	class TestClass9 {}
	@injectable()
	class TestClass10 {
		@inject(TestClass9) testClass9: TestClass9;
	}
	const instance = container.resolve(TestClass10);
	const instance2 = container.resolve(TestClass10);
	assert.strictEqual(instance.testClass9, instance2.testClass9);
});

test("should resolve class with lots of dependencies correctly", (t) => {
	@injectable({ singleton: true })
	class TestClass11 {}
	@injectable()
	class TestClass12 {
		@inject(TestClass11) testClass11: TestClass11;
	}
	@injectable()
	class TestClass13 {
		@inject(TestClass12) testClass12: TestClass12;
	}
	@injectable()
	class TestClass14 {
		@inject(TestClass13) testClass13: TestClass13;
	}
	@injectable()
	class TestClass15 {
		@inject(TestClass14) testClass14: TestClass14;
	}

	@injectable()
	class TestClass16 {
		@inject(TestClass15) testClass15: TestClass15;
		@inject(TestClass14) testClass14: TestClass14;
		@inject(TestClass13) testClass13: TestClass13;
		@inject(TestClass12) testClass12: TestClass12;
		@inject(TestClass11) testClass11: TestClass11;
	}

	const instance = container.resolve(TestClass15);
	assert.strictEqual(
		instance.testClass14.testClass13.testClass12.testClass11 instanceof
			TestClass11,
		true,
	);

	const instance2 = container.resolve(TestClass16);

	assert.strictEqual(instance2 instanceof TestClass16, true);
});

test("should register factory correctly", () => {
	const factory = () => "test";
	container.register("test", factory, false);
	assert.strictEqual(container["tokenToValue"].has("test"), true);
});

test("should resolve factory correctly", () => {
	const factory = () => "test";
	container.register("test", factory, false);
	const instance = container.resolve("test");
	assert.strictEqual(instance, "test");
});

test("should resolve factory as a singleton correctly", () => {
	var counter = 1;

	const factory = () => counter++;
	container.register("test", factory, true);
	const instance = container.resolve("test");
	const instance2 = container.resolve("test");
	assert.strictEqual(instance, instance2);
});

test("should register value correctly", () => {
	container.register("test1", "test1", false);
	assert.strictEqual(container["tokenToResolved"].has("test1"), true);
});

test("should resolve value correctly", () => {
	container.register("test2", "test2", false);
	const instance = container.resolve("test2");
	assert.strictEqual(instance, "test2");
});

test("should resolve value as a singleton correctly", () => {
	container.register("test3", "test3", true);
	const instance = container.resolve("test3");
	const instance2 = container.resolve("test3");
	assert.strictEqual(instance, instance2);
});

test("should be able to inject using string token", () => {
	container.register("test3", "test3", false);
	@injectable()
	class TestClass17 {
		@inject("test3") test3: string;
	}
	const instance = container.resolve(TestClass17);
	assert.strictEqual(instance.test3, "test3");
});

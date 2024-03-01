export type Token = Class | string;

export type Class = new (...args: any[]) => any;
export type ResolvedValue = string | number | boolean | InstanceType<Class>;

export type ValueToBeResolved =
	| Factory
	| Class
	| ResolvedValue
	| (() => unknown);

export type Factory = () => ResolvedValue;

export class Container {
	private static instance: Container;
	private tokenToValue: Map<
		string,
		{ singleton?: boolean; value: Array<ValueToBeResolved> }
	> = new Map();
	private tokenToResolved: Map<string, ResolvedValue> = new Map();

	private constructor() {}
	public static getInstance() {
		if (!Container.instance) {
			Container.instance = new Container();
		}
		return Container.instance;
	}

	public resolve<T extends Token>(token: T): ResolvedValue {
		const parsedToken: string = typeof token === "string" ? token : token.name;

		if (this.tokenToResolved.has(parsedToken)) {
			return this.tokenToResolved.get(parsedToken)[0] as ResolvedValue;
		}

		const storedValue = this.tokenToValue.get(parsedToken);

		if (!storedValue) {
			throw new Error(`No value found for token ${parsedToken}`);
		}

		let instance: ResolvedValue = storedValue.value[0];

		if (this.isClass(storedValue.value[0])) {
			instance = new storedValue.value[0]();
		}

		if (this.isFactory(storedValue.value[0])) {
			instance = storedValue.value[0]();
		}

		if (storedValue.singleton) {
			this.tokenToResolved.set(parsedToken, [instance]);
		}

		return instance;
	}

	public register<T extends Class>(
		clazz: T,
		value: T,
		singleton: boolean,
	): void;
	public register<T extends ResolvedValue>(
		token: string,
		value: T,
		singleton: boolean,
	): void;
	public register<T extends Factory>(
		token: string,
		value: T,
		singleton: boolean,
	): void;
	public register<T extends Class | ResolvedValue | Factory>(
		token: string,
		value: T,
		singleton = false,
	) {
		if (this.isClass(token)) {
			return this.registerClass(token, singleton);
		}

		if (this.isFactory(value)) {
			return this.registerFactory(token, value, singleton);
		}

		return this.registerValue(token, value);
	}

	private registerClass(clazz: Class, singleton = false) {
		const register = this.tokenToValue.get(clazz.name);

		const values = register?.value || [];

		this.tokenToValue.set(clazz.name, { singleton, value: [clazz, ...values] });
	}

	private registerValue<T>(name: string, value: T) {
		const register = this.tokenToResolved.get(name);

		const values = register?.value || [];

		this.tokenToResolved.set(name, [value, ...values]);
	}

	private registerFactory<T>(
		name: string,
		factory: () => T,
		singleton = false,
	) {
		const register = this.tokenToValue.get(name);

		const values = register?.value || [];

		this.tokenToValue.set(name, { singleton, value: [factory, ...values] });
	}

	dispose() {
		this.tokenToResolved.clear();
		this.tokenToValue.clear();
	}

	private isClass(value: any): value is Class {
		return (
			typeof value === "function" &&
			Object.getOwnPropertyNames(value).includes("prototype")
		);
	}

	private isFactory(value: any): value is Factory {
		return typeof value === "function" && !this.isClass(value);
	}
}

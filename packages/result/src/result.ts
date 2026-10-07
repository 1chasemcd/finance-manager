class _Result<T, E> {
  protected constructor(
    protected readonly _ok: boolean,
    protected readonly value: T | E,
  ) {}

  map<U>(f: (value: T) => U): Result<U, E> {
    return this._ok ? new Ok(f(this.value as T)) : (this as unknown as Err<E>);
  }

  equals(that: unknown): boolean {
    return that instanceof _Result && this._ok === that._ok && this.value === that.value;
  }

  toJSON() {
    return {
      _ok: this._ok,
      [this._ok ? "data" : "error"]: this.value,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON();
  }
}

export class Ok<T> extends _Result<T, never> {
  readonly isOk = true as const;
  readonly isErr = false as const;

  constructor(value: T) {
    super(true, value);
  }

  get data(): T {
    return this.value;
  }
}

export class Err<E> extends _Result<never, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;

  constructor(error: E) {
    super(false, error);
  }

  get error(): E {
    return this.value;
  }
}

export type Result<T, E> = Ok<T> | Err<E>;

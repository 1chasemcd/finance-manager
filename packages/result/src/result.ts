export type ErrorType = {
  _tag: string;
  [key: string]: unknown;
};

type MatchCases<T, E extends ErrorType, U> = {
  Ok: (data: T) => U;
} & {
  [K in E["_tag"]]: (error: Extract<E, { _tag: K }>) => U;
};

type MatchCasesWithDefault<T, E extends ErrorType, U> = {
  Ok: (data: T) => U;
  Default: (error: E) => U;
} & Partial<{
  [K in E["_tag"]]: (error: Extract<E, { _tag: K }>) => U;
}>;

class _Result<T, E extends ErrorType> {
  protected constructor(
    protected readonly _ok: boolean,
    protected readonly value: T | E,
  ) {}

  map<U>(f: (value: T) => U): Result<U, E> {
    return this._ok ? new Ok(f(this.value as T)) : (this as unknown as Err<E>);
  }

  match<U>(cases: MatchCases<T, E, U> | MatchCasesWithDefault<T, E, U>): U {
    if (this._ok) return cases.Ok(this.value as T);

    const error = this.value as E;
    let errorHandler = cases[error._tag as keyof typeof cases] as ((error: E) => U) | undefined;
    errorHandler ??= "Default" in cases ? cases.Default : undefined;
    if (!errorHandler) throw new Error(`Unhandled error tag: ${error._tag}`);
    return errorHandler(error);
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

export class Err<E extends ErrorType> extends _Result<never, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;

  constructor(error: E) {
    super(false, error);
  }

  get error(): E {
    return this.value;
  }
}

export type Result<T, E extends ErrorType> = Ok<T> | Err<E>;

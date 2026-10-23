type MockCallback = (request: Request) => Response | Promise<Response>;

export interface FetchMock {
  readonly reset: () => void;
  readonly register: (url: string, callback: MockCallback) => void;
  readonly handleFetch: typeof fetch;
  get requests(): Request[];
}

export function createFetchMock(): FetchMock {
  const mocks = new Map<string, MockCallback>();
  const requests: Request[] = [];

  return {
    reset() {
      requests.length = 0;
      mocks.clear();
    },
    register(url: string, callback: MockCallback) {
      mocks.set(url, callback);
    },
    handleFetch(input: string | Request | URL, init?: RequestInit): Promise<Response> {
      const request = new Request(input, init);
      requests.push(request);
      const mock = mocks.get(request.url);
      if (!mock) throw new Error(`No fetch mock registered for url ${request.url}`);

      const res = mock(request);
      if (res instanceof Promise) return res;
      else return Promise.resolve(res);
    },
    get requests() {
      return requests;
    },
  };
}

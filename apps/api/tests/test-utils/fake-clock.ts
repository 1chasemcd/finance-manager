import type { CurrentTime } from "../../src/types/current-time";

export interface FakeClock {
  readonly currentTime: CurrentTime;
  advance(ms: number): void;
}

export function createFakeClock(start: Date): FakeClock {
  let now = start;
  return {
    currentTime: () => now,
    advance(ms: number): void {
      now = new Date(now.getTime() + ms);
    },
  };
}

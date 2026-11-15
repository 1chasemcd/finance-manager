import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrapResponse } from "../test-utils/unwrap";
import type { User } from "@/users/user.types";

const { app, login } = createWorker();

const alice = { email: "alice@example.com", name: "Alice Smith" };

describe("/api/source", () => {
  it("enables crud operations on source", async () => {
    const token = await login(alice);
    const response = await unwrapResponse<User[]>(app.auth(token).get("/api/user"));

    expect(response).toEqual([
      {
        id: response[0]?.id,
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { CurrentUser } from "./current-user";
import type { User } from "../users/user.types";

const user: User = {
  id: 3,
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  subject: "subject-3",
  groupId: 9,
};

function createCurrentUser(): { currentUser: CurrentUser; store: { user?: User } } {
  const store: { user?: User } = {};
  return { currentUser: new CurrentUser(() => store), store };
}

describe("CurrentUser", () => {
  it("returns undefined when the request has no user", () => {
    const { currentUser } = createCurrentUser();
    expect(currentUser.get()).toBeUndefined();
  });

  it("throws from require when the request has no user", () => {
    const { currentUser } = createCurrentUser();
    expect(() => {
      currentUser.require();
    }).toThrow("No authenticated user in current request.");
  });

  it("returns the user from the request context", () => {
    const { currentUser, store } = createCurrentUser();
    store.user = user;
    expect(currentUser.get()).toBe(user);
    expect(currentUser.require()).toBe(user);
  });

  it("propagates context lookup failures", () => {
    const currentUser = new CurrentUser(() => {
      throw new Error("no request scope");
    });
    expect(() => currentUser.get()).toThrow("no request scope");
  });
});

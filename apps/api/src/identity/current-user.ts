import { invariant } from "@finapp/result";
import { type GetRequestContext } from "../core/request-context";
import type { User } from "../users/user.types";

export class CurrentUser {
  constructor(private readonly requestContext: GetRequestContext) {}

  get(): User | undefined {
    return this.requestContext().user;
  }

  require(): User {
    const user = this.get();

    invariant(user, "No authenticated user in current request.");

    return user;
  }
}

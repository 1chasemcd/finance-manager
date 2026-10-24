import { invariant } from "@finapp/result";
import { type RequestContext } from "@/middleware/request-context";
import type { User } from "@/users/user.types";

export class CurrentUser {
  constructor(private readonly requestContext: RequestContext) {}

  get(): User | undefined {
    return this.requestContext()?.user;
  }

  require(): User {
    const user = this.get();

    invariant(user, "No authenticated user in current request.");

    return user;
  }
}

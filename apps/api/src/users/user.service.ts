import { type Result } from "@finapp/result";
import type { UserRepository } from "./user.repository";
import type { OnboardUserInput, User } from "./user.types";
import type { NotFound, Conflict } from "../core/result";
import type { GroupRepository } from "../groups/group.repository";

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly groups: GroupRepository,
  ) {}

  getUser(subject: string): Promise<Result<User, NotFound>> {
    return this.users.findBySubject(subject);
  }

  async onboardUser(input: OnboardUserInput): Promise<Result<User, Conflict>> {
    const group = await this.groups.createGroup();
    const [firstName = "", lastName = ""] = input.name.split(" ");

    return this.users.createUser({
      email: input.email,
      firstName,
      lastName,
      subject: input.subject,
      groupId: group.id,
    });
  }
}

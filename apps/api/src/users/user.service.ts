import { type Result } from "@finapp/result";
import type { UserRepository } from "./user.repository";
import type { OnboardUserInput, User } from "./user.types";
import type { NotFound, Conflict } from "../core/errors";
import type { GroupRepository } from "../groups/group.repository";

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly groups: GroupRepository,
  ) {}

  getUser(subject: string): Promise<Result<User, NotFound>> {
    return this.users.getBySubject(subject);
  }

  async onboardUser(input: OnboardUserInput): Promise<Result<User, Conflict>> {
    const group = await this.groups.createGroup();
    const { firstName, lastName } = splitName(input.name);

    return this.users.createUser({
      email: input.email,
      firstName,
      lastName,
      subject: input.subject,
      groupId: group.id,
    });
  }
}

function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  const separator = trimmed.indexOf(" ");

  if (separator === -1) return { firstName: trimmed, lastName: "" };

  return {
    firstName: trimmed.slice(0, separator),
    lastName: trimmed.slice(separator + 1).trim(),
  };
}

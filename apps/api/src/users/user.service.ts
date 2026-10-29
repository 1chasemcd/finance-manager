import { ok, type Result } from "@finapp/result";
import type { UserRepository } from "./user.repository";
import type { User } from "./user.types";
import { type NotFound, type Conflict, notFound, conflict } from "@/core/errors";
import type { GroupRepository } from "@/groups/group.repository";

interface OnboardUserInput {
  email: string;
  name: string;
  subject: string;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly groups: GroupRepository,
  ) {}

  async getUser(subject: string): Promise<Result<User, NotFound>> {
    const result = await this.users.bySubject(subject);
    return result ? ok(result) : notFound("user", subject);
  }

  async onboardUser(input: OnboardUserInput): Promise<Result<User, Conflict>> {
    const group = await this.groups.create();
    const { firstName, lastName } = splitName(input.name);

    const result = await this.users.create({
      email: input.email,
      firstName,
      lastName,
      subject: input.subject,
      groupId: group.id,
    });
    if (result.isOk) return result;
    return conflict();
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

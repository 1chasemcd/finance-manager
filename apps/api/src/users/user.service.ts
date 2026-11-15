import { err, ok, type Result } from "@finapp/result";
import type { UserRepository } from "./user.repository";
import type { User } from "./user.types";
import type { GroupRepository } from "@/groups/group.repository";
import type { CurrentUser } from "@/identity/current-user";

interface OnboardUserInput {
  email: string;
  name: string;
  subject: string;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly groups: GroupRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async getUser(subject: string): Promise<Result<User>> {
    const result = await this.users.bySubject(subject);
    return result ? ok(result) : err();
  }

  all(): Promise<User[]> {
    return this.users.byGroup(this.currentUser.require().groupId);
  }

  async onboardUser(input: OnboardUserInput): Promise<Result<User>> {
    const group = await this.groups.create();
    const { firstName, lastName } = splitName(input.name);

    return this.users.create({
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

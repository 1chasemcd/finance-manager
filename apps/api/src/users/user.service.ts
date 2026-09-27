import type { UserRepository } from "./user.repository";
import { CreateUser, UpdateUser } from "./user.schemas";

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getall() {
    return this.users.getall();
  }

  async lookup(id: number) {
    return this.users.lookup(id);
  }

  async create(user: CreateUser) {
    return this.users.create(user);
  }

  async update(id: number, user: UpdateUser) {
    return this.users.update(id, user);
  }

  async delete(id: number) {
    return this.users.delete(id);
  }
}

import { err, ok, type Result } from "@finapp/result";
import type { SourceRepository } from "./source.repository";
import type { CreateSourceInput, Source, UpdateSourceInput } from "./source.types";
import type { Db } from "@/db/client";
import { fileFormats, sources, users } from "@/db/schema";
import { and, eq, exists, SQL, sql } from "drizzle-orm";
import type { CreateError, DeleteError, UpdateError } from "@/core/errors";

export class SourceDrizzleRepository implements SourceRepository {
  constructor(private readonly db: Db) {}

  async byPublicId(groupId: number, publicId: string): Promise<Source | null> {
    const [result] = await this.selectSources()
      .where(and(eq(sources.groupId, groupId), eq(sources.publicId, publicId)))
      .limit(1);
    return result ?? null;
  }

  all(groupId: number): Promise<Source[]> {
    return this.selectSources().where(eq(sources.groupId, groupId));
  }
  async create(groupId: number, input: CreateSourceInput): Promise<Result<Source, CreateError>> {
    const { name, description = null, fileFormatPublicId = null, ownerEmail } = input;

    const ownerId = sql`(select ${users.id} from ${users}
      where ${users.groupId} = ${groupId} 
      and ${users.email} = ${ownerEmail})`;
    const fileFormatId = sql`(select ${fileFormats.id} from ${fileFormats} 
      where ${fileFormats.groupId} = ${groupId} 
      and ${fileFormats.publicId} = ${fileFormatPublicId})`;

    const [newRow] = await this.db
      .insert(sources)
      .values({ groupId, name, description, ownerId, fileFormatId })
      .returning({ publicId: sources.publicId });

    if (!newRow) return err("CreateError");
    return ok({ ...newRow, name, description, ownerEmail, fileFormatPublicId, archived: false });
  }
  async update(
    groupId: number,
    publicId: string,
    { ownerEmail, fileFormatPublicId, ...input }: UpdateSourceInput,
  ): Promise<Result<void, UpdateError>> {
    let ownerId: SQL<number> | undefined;
    let fileFormatId: SQL<number> | undefined;

    if (ownerEmail)
      ownerId = sql`select ${users.id} from ${users} 
        where ${users.groupId} = ${groupId} 
        and ${users.email} = ${ownerEmail}`;
    if (fileFormatPublicId)
      fileFormatId = sql`select ${fileFormats.id} from ${fileFormats} 
        where ${fileFormats.groupId} = ${groupId} 
        and ${fileFormats.publicId} = ${fileFormatPublicId}`;

    const response = await this.db
      .update(sources)
      .set({
        ...input,
        ownerId,
        fileFormatId,
      })
      .where(
        and(
          eq(sources.groupId, groupId),
          eq(sources.publicId, publicId),
          ownerId ? exists(ownerId) : undefined,
          fileFormatId ? exists(fileFormatId) : undefined,
        ),
      )
      .limit(1);

    if (response.meta.changes != 1) return err("UpdateError");
    return ok();
  }
  async delete(groupId: number, publicId: string): Promise<Result<void, DeleteError>> {
    const response = await this.db
      .delete(sources)
      .where(and(eq(sources.groupId, groupId), eq(sources.publicId, publicId)))
      .limit(1);
    if (response.meta.changes != 1) return err("DeleteError");
    return ok();
  }

  private columns() {
    return {
      publicId: sources.publicId,
      name: sources.name,
      description: sources.description,
      archived: sources.archived,
      ownerEmail: users.email,
      fileFormatPublicId: fileFormats.publicId.as("fileFormatPublicId"),
    };
  }

  private selectSources() {
    return this.db
      .select(this.columns())
      .from(sources)
      .innerJoin(users, eq(sources.ownerId, users.id))
      .innerJoin(fileFormats, eq(sources.fileFormatId, fileFormats.id));
  }
}

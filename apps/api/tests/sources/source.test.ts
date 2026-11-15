import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrapResponse } from "../test-utils/unwrap";
import type { Source } from "@/sources/source.types";
import type { User } from "@/users/user.types";

const { app, login } = createWorker();

const alice = { email: "alice@example.com", name: "Alice Smith" };

describe("/api/source", () => {
  it("enables crud operations on source", async () => {
    const aliceToken = await login(alice);
    const aliceApp = app.auth(aliceToken);

    const ownerId = (await unwrapResponse<User[]>(aliceApp.get("/api/user")))[0]?.id;

    expect(await unwrapResponse<Source[]>(aliceApp.get("/api/source"))).toEqual([]);

    const added = await unwrapResponse<Source>(
      aliceApp.post("/api/source", {
        name: "Test",
        description: "Test Description",
        ownerId,
      }),
    );

    expect(added).toEqual({
      id: added.id,
      name: "Test",
      description: "Test Description",
      archived: false,
      ownerId,
      fileFormatId: null,
    });

    expect(await unwrapResponse<Source[]>(aliceApp.get("/api/source"))).toEqual([added]);

    expect(
      (
        await aliceApp.put(`/api/source/${added.id.toString()}`, {
          name: "Name Updated",
          description: "Description Updated",
          archived: true,
          ownerId,
          fileFormatId: null,
        })
      ).status,
    ).toBe(204);

    const updated = await unwrapResponse(aliceApp.get(`/api/source/${added.id.toString()}`));
    expect(updated).toEqual({
      id: added.id,
      name: "Name Updated",
      description: "Description Updated",
      archived: true,
      canDelete: true,
      ownerId,
      fileFormatId: null,
    });

    expect((await aliceApp.delete(`/api/source/${added.id.toString()}`)).status).toBe(204);
    expect(await unwrapResponse<Source[]>(aliceApp.get("/api/source"))).toEqual([]);
  });
});

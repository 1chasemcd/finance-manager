import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrapResponse } from "../test-utils/unwrap";
import type { Source } from "@/sources/source.types";
import type { FileFormatDetail, FileFormat } from "@/file-formats/file-format.types";

const { app, login } = createWorker();

const user = { email: "test.user@example.com", name: "Test User" };

describe("/api/fileformat", () => {
  it("enables crud operations on file format", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    expect(await unwrapResponse<FileFormat[]>(authedApp.get("/api/fileformat"))).toEqual([]);

    const added = await unwrapResponse<FileFormat>(
      authedApp.post("/api/fileformat", {
        name: "Test File Format",
        positiveIsSpending: true,
        rowPattern: "123",
        skipRows: 2,
        summaryIndex: 1,
        dateIndex: 2,
        amountIndex: 3,
        dateFormat: "yyyymmdd",
      }),
    );

    expect(added).toEqual({
      id: added.id,
      name: "Test File Format",
      positiveIsSpending: true,
      rowPattern: "123",
      skipRows: 2,
      summaryIndex: 1,
      dateIndex: 2,
      amountIndex: 3,
      dateFormat: "yyyymmdd",
    });

    expect(await unwrapResponse<FileFormat[]>(authedApp.get("/api/fileformat"))).toEqual([added]);

    expect(
      (
        await authedApp.put(`/api/fileformat/${added.id.toString()}`, {
          name: "Name Updated",
          positiveIsSpending: false,
          rowPattern: "456",
          skipRows: 3,
          summaryIndex: 3,
          dateIndex: 1,
          amountIndex: 2,
          dateFormat: "mmddyyyy",
        })
      ).status,
    ).toBe(204);

    const updated = await unwrapResponse<FileFormatDetail>(
      authedApp.get(`/api/fileformat/${added.id.toString()}`),
    );
    expect(updated).toEqual({
      id: added.id,
      name: "Name Updated",
      positiveIsSpending: false,
      rowPattern: "456",
      skipRows: 3,
      summaryIndex: 3,
      dateIndex: 1,
      amountIndex: 2,
      dateFormat: "mmddyyyy",
      canDelete: true,
    });

    expect((await authedApp.delete(`/api/fileformat/${added.id.toString()}`)).status).toBe(204);
    expect(await unwrapResponse<Source[]>(authedApp.get("/api/fileformat"))).toEqual([]);
  });
});

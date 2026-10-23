import { screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import PageHeader from "@/components/PageHeader/PageHeader";
import Categories from "@/pages/Categories";
import CategoryRules from "@/pages/CategoryRules";
import Dashboard from "@/pages/Dashboard";
import FileFormats from "@/pages/FileFormats";
import ImportBatch from "@/pages/ImportBatch";
import Sources from "@/pages/Sources";
import Transactions from "@/pages/Transactions";
import { renderWithProviders } from "./test-utils";

const pages: readonly [title: string, body: string, Page: ComponentType][] = [
  ["Dashboard", "Dashboard Works!", Dashboard],
  ["Transactions", "Transactions Works!", Transactions],
  ["Import Batch", "ImportBatch Works!", ImportBatch],
  ["Categories", "Categories Works!", Categories],
  ["Sources", "Sources Works!", Sources],
  ["File Formats", "FileFormats Works!", FileFormats],
  ["Category Rules", "Category Rules Works!", CategoryRules],
];

describe("pages", () => {
  it.each(pages)("renders the %s page", (title, body, Page) => {
    renderWithProviders(
      <>
        <PageHeader />
        <Page />
      </>,
    );

    expect(screen.getByRole("heading", { level: 4, name: title })).toBeInTheDocument();
    expect(screen.getByText(body)).toBeInTheDocument();
  });
});

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PageHeader from "@/components/PageHeader/PageHeader";
import Account from "@/pages/Account";
import { jsonResponse, renderWithProviders, stubFetch } from "./test-utils";

const me = { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" };
const teammate = { firstName: "Grace", lastName: "Hopper", email: "grace@example.com" };
const pendingInvite = {
  inviteId: "invite-123",
  groupMembers: [{ firstName: "Alan", lastName: "Turing", email: "alan@example.com" }],
  createdAt: "2026-01-01T00:00:00.000Z",
};

function accountResponse(extra?: { pendingInvite?: typeof pendingInvite }) {
  return {
    me,
    groupMembers: [me, teammate],
    ...extra,
  };
}

describe("Account page", () => {
  it("shows a loading indicator until account information arrives", () => {
    stubFetch({ "GET /api/account": () => new Promise(() => undefined) });

    renderWithProviders(<Account />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows an error with a retry action when account information cannot be loaded", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    stubFetch({
      "GET /api/account": () => {
        attempts += 1;
        return attempts === 1 ? jsonResponse({}, 500) : jsonResponse(accountResponse());
      },
    });

    renderWithProviders(<Account />);

    expect(await screen.findByText("Failed to load account information.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByLabelText("First Name")).toHaveValue("Ada");
    expect(attempts).toBe(2);
  });

  it("renders personal info and the group members table", async () => {
    stubFetch({ "GET /api/account": () => jsonResponse(accountResponse()) });

    renderWithProviders(
      <>
        <PageHeader />
        <Account />
      </>,
    );

    expect(await screen.findByLabelText("First Name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Lovelace");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByRole("heading", { level: 4, name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Personal Info" })).toBeInTheDocument();
    expect(
      screen.getByText("Invite users to your group to manage your finances together."),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", { name: "group members table" });
    expect(within(table).getByText("Ada Lovelace (me)")).toBeInTheDocument();
    expect(within(table).getByText("Grace Hopper")).toBeInTheDocument();
    expect(within(table).getByText("grace@example.com")).toBeInTheDocument();
  });

  it("sends an invite and confirms with a snackbar", async () => {
    const user = userEvent.setup();
    const { calls } = stubFetch({
      "GET /api/account": () => jsonResponse(accountResponse()),
      "POST /api/invite": () => jsonResponse(null, 204),
    });

    renderWithProviders(<Account />);

    await user.click(await screen.findByRole("button", { name: "Send an Invite" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Send Invitation")).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Specify the email address of the user you would like to invite to your group.",
      ),
    ).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Email Address/), "grace@example.com");
    await user.click(within(dialog).getByRole("button", { name: "Send Invite" }));

    expect(await screen.findByText("Invitation sent")).toBeInTheDocument();

    const inviteCall = calls.find(
      (call) => call.method === "POST" && call.url.endsWith("/api/invite"),
    );
    expect(inviteCall).toBeDefined();
    const body: unknown = JSON.parse(inviteCall?.body ?? "null");
    expect(body).toEqual({ email: "grace@example.com" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows an error snackbar when the invitation request fails", async () => {
    const user = userEvent.setup();
    stubFetch({
      "GET /api/account": () => jsonResponse(accountResponse()),
      "POST /api/invite": () => jsonResponse({}, 409),
    });

    renderWithProviders(<Account />);

    await user.click(await screen.findByRole("button", { name: "Send an Invite" }));

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/Email Address/), "grace@example.com");
    await user.click(within(dialog).getByRole("button", { name: "Send Invite" }));

    expect(await screen.findByText("The invitation could not be sent")).toBeInTheDocument();
  });

  it("accepts a pending group invitation", async () => {
    const user = userEvent.setup();
    const { calls } = stubFetch({
      "GET /api/account": () => jsonResponse(accountResponse({ pendingInvite })),
      "POST /api/invite/invite-123/accept": () => jsonResponse(null, 204),
    });

    renderWithProviders(<Account />);

    expect(await screen.findByText("You have a pending group invitation.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send an Invite" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Manage Invitation" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Manage Group Invitation" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "You have been invited to join a group with 'Alan Turing'. Would you like to accept the invitation?",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Data Loss Warning")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Accept" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(
      calls.some(
        (call) => call.method === "POST" && call.url.endsWith("/api/invite/invite-123/accept"),
      ),
    ).toBe(true);
  });

  it("declines a pending group invitation", async () => {
    const user = userEvent.setup();
    const { calls } = stubFetch({
      "GET /api/account": () => jsonResponse(accountResponse({ pendingInvite })),
      "POST /api/invite/invite-123/decline": () => jsonResponse(null, 204),
    });

    renderWithProviders(<Account />);

    await user.click(await screen.findByRole("button", { name: "Manage Invitation" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Decline" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(
      calls.some(
        (call) => call.method === "POST" && call.url.endsWith("/api/invite/invite-123/decline"),
      ),
    ).toBe(true);
  });
});

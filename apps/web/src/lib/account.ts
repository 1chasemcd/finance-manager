import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

type AccountResponse = Awaited<ReturnType<typeof api.account.$get>>;

export type AccountInfo = Awaited<ReturnType<AccountResponse["json"]>>;
export type AccountUser = AccountInfo["me"];
export type PendingInvite = NonNullable<AccountInfo["pendingInvite"]>;

export const accountQueryKey = ["account"] as const;

function ensureOk(res: { ok: boolean; status: number }): void {
  if (!res.ok) throw new Error(`Request failed with status ${res.status.toString()}`);
}

export function useAccountInfo() {
  return useQuery({
    queryKey: accountQueryKey,
    queryFn: async () => {
      const res = await api.account.$get();
      ensureOk(res);
      return await res.json();
    },
  });
}

function useInvalidateAccountInfo() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: accountQueryKey });
}

export function useSendInvite() {
  const invalidateAccountInfo = useInvalidateAccountInfo();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await api.account.invite.$post({ json: { email } });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

export function useAcceptInvite() {
  const invalidateAccountInfo = useInvalidateAccountInfo();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await api.account.invite[":inviteId"].accept.$post({ param: { inviteId } });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

export function useDeclineInvite() {
  const invalidateAccountInfo = useInvalidateAccountInfo();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await api.account.invite[":inviteId"].decline.$post({ param: { inviteId } });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

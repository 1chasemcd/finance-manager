import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ensureOk } from ".";
import type z from "zod";
import type { inviteUserSchema } from "@finapp/schema";

type InviteUserRequestData = z.infer<typeof inviteUserSchema>;

type AccountResponse = Awaited<ReturnType<typeof api.account.$get>>;

export type AccountInfo = Awaited<ReturnType<AccountResponse["json"]>>;
export type AccountUser = AccountInfo["me"];
export type PendingInvite = NonNullable<AccountInfo["pendingInvite"]>;

export const accountQueryKey = ["account"] as const;

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
    mutationFn: async (request: InviteUserRequestData) => {
      const res = await api.account.invite.$post({ json: request });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

export function useAcceptInvite() {
  const invalidateAccountInfo = useInvalidateAccountInfo();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.account.invite[":id"].accept.$post({ param: { id: id.toString() } });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

export function useDeclineInvite() {
  const invalidateAccountInfo = useInvalidateAccountInfo();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.account.invite[":id"].decline.$post({ param: { id: id.toString() } });
      ensureOk(res);
    },
    onSuccess: invalidateAccountInfo,
  });
}

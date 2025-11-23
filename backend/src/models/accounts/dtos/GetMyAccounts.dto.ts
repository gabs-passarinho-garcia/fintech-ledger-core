import { t } from 'elysia';

export const AccountSchema = t.Object({
  id: t.String(),
  tenantId: t.String(),
  profileId: t.Nullable(t.String()),
  name: t.String(),
  balance: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const GetMyAccountsResponseSchema = t.Object({
  accounts: t.Array(AccountSchema),
});

export type GetMyAccountsResponse = {
  accounts: Array<{
    id: string;
    tenantId: string;
    profileId: string | null;
    name: string;
    balance: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

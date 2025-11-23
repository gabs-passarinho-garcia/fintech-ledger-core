import { t } from 'elysia';

export const ListAccountsByProfileParamsSchema = t.Object({
  profileId: t.String(),
});

export const ListAccountsByProfileResponseSchema = t.Object({
  accounts: t.Array(
    t.Object({
      id: t.String(),
      tenantId: t.String(),
      profileId: t.Nullable(t.String()),
      name: t.String(),
      balance: t.String(),
      createdAt: t.Date(),
      updatedAt: t.Date(),
    }),
  ),
});

export type ListAccountsByProfileResponse = {
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

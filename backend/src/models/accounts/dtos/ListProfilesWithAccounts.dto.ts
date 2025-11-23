import { t } from 'elysia';

export const ProfileWithAccountsSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  tenantId: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  balance: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  accounts: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      balance: t.String(),
    }),
  ),
});

export const ListProfilesWithAccountsResponseSchema = t.Object({
  profiles: t.Array(ProfileWithAccountsSchema),
});

export type ListProfilesWithAccountsResponse = {
  profiles: Array<{
    id: string;
    userId: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    balance: string;
    createdAt: Date;
    updatedAt: Date;
    accounts: Array<{
      id: string;
      name: string;
      balance: string;
    }>;
  }>;
};

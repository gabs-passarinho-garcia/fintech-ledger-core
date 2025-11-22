import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Profile, ProfileFactory } from '../../domain';

/**
 * Repository for updating profile entities.
 * Handles updates to profile data.
 */
export class UpdateProfileRepository {
  private readonly prisma: PrismaHandler;

  public constructor(opts: { [AppProviders.prisma]: PrismaHandler }) {
    this.prisma = opts.prisma;
  }

  /**
   * Updates a profile in the database.
   *
   * @param args - Update parameters
   * @param args.profileId - The profile ID to update
   * @param args.firstName - Optional new first name
   * @param args.lastName - Optional new last name
   * @param args.email - Optional new email
   * @param args.tx - Optional transaction context
   * @returns The updated profile entity
   * @throws {NotFoundError} If the profile is not found
   */
  public async update(args: {
    profileId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    tx?: ITransactionContext;
  }): Promise<Profile> {
    const client = args.tx?.prisma || this.prisma;

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (args.firstName !== undefined) {
      updateData.firstName = args.firstName;
    }

    if (args.lastName !== undefined) {
      updateData.lastName = args.lastName;
    }

    if (args.email !== undefined) {
      updateData.email = args.email.toLowerCase().trim();
    }

    const updated = await client.profile.update({
      where: {
        id: args.profileId,
        deletedAt: null,
      },
      data: updateData,
    });

    return ProfileFactory.reconstruct({
      id: updated.id,
      userId: updated.userId,
      tenantId: updated.tenantId,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
    });
  }
}

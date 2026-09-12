export interface UserMapping {
  getUserByExternalId(externalId: string): Promise<number | undefined>;
  mapUser(externalId: string, digestUserId: number): Promise<void>;
  getMappedUserIds(): Promise<Array<{ sub: string; digestUserId: number }>>;
}

export class InMemoryUserMapping implements UserMapping {
  private mapping: Map<string, number> = new Map();

  async getUserByExternalId(externalId: string): Promise<number | undefined> {
    return this.mapping.get(externalId);
  }

  async mapUser(externalId: string, digestUserId: number): Promise<void> {
    this.mapping.set(externalId, digestUserId);
  }

  async getMappedUserIds(): Promise<Array<{ sub: string; digestUserId: number }>> {
    const result: Array<{ sub: string; digestUserId: number }> = [];
    for (const [sub, digestUserId] of this.mapping) {
      result.push({ sub, digestUserId });
    }
    return Promise.resolve(result);
  }
}
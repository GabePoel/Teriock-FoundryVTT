declare module "./status-expiration.mjs" {
  export default interface StatusExpiration {
    statuses: { absent: Set<Teriock.Keys.Condition>, present: Set<Teriock.Keys.Condition> };
  }
}

export {};

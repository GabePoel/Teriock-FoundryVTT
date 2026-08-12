declare module "./attunement-system.mjs" {
  export default interface AttunementSystem {
    /** <schema> Should this inherit the tier of the target entity? */
    inheritTier: boolean;
    /** <schema> The entity that this attunement corresponds to */
    target: TeriockItem<"equipment" | "mount"> | null;
    /** <schema> Presence tier of the target entity */
    tier: number;
  }
}

export {};

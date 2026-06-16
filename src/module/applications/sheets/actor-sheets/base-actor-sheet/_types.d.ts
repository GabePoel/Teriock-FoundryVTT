declare global {
  namespace Teriock.Sheet {
    /** Actor sheet display settings */
    export type BaseActorSheetSettings = {
      /** Path used for avatar image */
      avatarImagePath: string;
      /** Whether the rules text for a given condition is expanded or collapsed */
      conditionExpansions: Partial<Record<Teriock.Keys.Condition, boolean>>;
    };
  }
}

export {};

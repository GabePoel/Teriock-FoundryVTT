declare module "./base-actor-system.mjs" {
  export default interface BaseActorSystem extends Teriock.Models.BaseActorSystemData {
    readonly parent: TeriockActor;
  }
}

declare global {
  namespace Teriock.Models {
    export interface BaseActorSystemData {
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.DocumentSettingsModelInstance<"actor">;
    }
  }
}

export {};

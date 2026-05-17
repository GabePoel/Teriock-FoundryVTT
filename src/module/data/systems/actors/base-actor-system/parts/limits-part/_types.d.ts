declare global {
  namespace Teriock.Models {
    export type ActorLimitsPartData = {
      /** <schema> <base> How many curses the {@link TeriockActor} has */
      curses: Foundry.BarField;
      /** <schema> <base> How many curses the {@link TeriockActor} has prepared */
      rotators: Foundry.BarField;
    };
  }
}

export {};

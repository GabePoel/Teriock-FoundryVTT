declare global {
  namespace Teriock.Models {
    export type ActorLimitsPartData = {
      /** <schema> <base> How many curses the {@link TeriockActor} has */
      curses: Teriock.Fields.BarField;
      /** <schema> <base> How many curses the {@link TeriockActor} has prepared */
      rotators: Teriock.Fields.BarField;
    };
  }
}

export {};

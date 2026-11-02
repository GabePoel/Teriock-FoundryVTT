declare global {
  namespace Teriock.Functionality {
    export interface ScalingModel {
      /** An icon that represents this. */
      get icon(): string;

      /** A label that represents this. */
      get label(): string;

      /** A numerical value. */
      get value(): number;
    }

    export interface StatProvider {
      /** Prepare all the stat dice this has access to. */
      prepareStatDice(): void;
    }

    export interface Usable {
      /** Do whatever the default roll or execution for this document is. */
      use(options?: Partial<Teriock.Command.UseOptions>): Promise<void>;
    }
  }
}

export {};

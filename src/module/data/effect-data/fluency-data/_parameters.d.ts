import type { tradecraftOptions } from "../../../constants/options/tradecraft-options.mjs";

declare global {
  namespace Teriock.Parameters.Fluency {
    /** Valid fields */
    export type Field = keyof typeof tradecraftOptions;

    /** Valid tradecrafts */
    export type Tradecraft =
      | keyof typeof tradecraftOptions.artisan.tradecrafts
      | keyof typeof tradecraftOptions.mediator.tradecrafts
      | keyof typeof tradecraftOptions.scholar.tradecrafts
      | keyof typeof tradecraftOptions.survivalist.tradecrafts
      | keyof typeof tradecraftOptions.prestige.tradecrafts;
  }
}

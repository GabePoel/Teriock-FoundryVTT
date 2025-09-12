declare global {
  namespace Teriock.Parameters.Fluency {
    /** Valid fields */
    export type Field = keyof typeof TERIOCK.options.tradecraft;

    /** Valid tradecrafts */
    export type Tradecraft =
      | keyof typeof TERIOCK.options.tradecraft.artisan.tradecrafts
      | keyof typeof TERIOCK.options.tradecraft.mediator.tradecrafts
      | keyof typeof TERIOCK.options.tradecraft.scholar.tradecrafts
      | keyof typeof TERIOCK.options.tradecraft.survivalist.tradecrafts
      | keyof typeof TERIOCK.options.tradecraft.prestige.tradecrafts;
  }
}

export {};
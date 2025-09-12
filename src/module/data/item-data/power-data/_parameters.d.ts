declare global {
  namespace Teriock.Parameters.Power {
    /** Power type */
    export type PowerType = keyof typeof TERIOCK.options.power;
  }
}

export {};
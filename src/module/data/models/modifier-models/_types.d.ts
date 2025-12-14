declare module "./modifier-model.mjs" {
  export default interface ExecutableModel {
    /** <schema> Bonus to add to the score */
    bonus: number;
    /** <schema> The canonical score number */
    score: number;
  }
}

export {};

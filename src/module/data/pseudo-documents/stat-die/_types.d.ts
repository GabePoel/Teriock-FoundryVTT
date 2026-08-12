declare module "./stat-die.mjs" {
  export default interface StatDie {
    _id: ID<StatDie>;
    faces: number;
    index: number;
  }
}

export {};

declare module "./virtual-affinity-model.mjs" {
  export default interface VirtualAffinityModel {
    amount: number;
    category: Teriock.Keys.AffinityCategory;
    competence: Teriock.System.CompetenceLevel;
    type: Teriock.Affinities.Type;
    value: string;
  }
}

export {};

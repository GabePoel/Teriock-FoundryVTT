export type TypeMetadata = {
  type: string;
}

export type EffectMetadata = TypeMetadata & {
  canSub: boolean;
}
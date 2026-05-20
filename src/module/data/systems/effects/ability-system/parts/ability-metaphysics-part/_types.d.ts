declare global {
  namespace Teriock.Models {
    export type AbilityTagsPartData = {
      /** <schema> If this ability is considered to be Elder Sorcery */
      elderSorcery: boolean;
      /** <schema> Wording of this ability's Elder Sorcery incant */
      elderSorceryIncant: string;
    };
  }
}

export {};

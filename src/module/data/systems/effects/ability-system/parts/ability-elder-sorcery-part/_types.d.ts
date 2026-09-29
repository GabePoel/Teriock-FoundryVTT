declare global {
  namespace Teriock.Models {
    export interface AbilityElderSorceryPartData {
      /** <schema> If this ability is considered to be Elder Sorcery */
      elderSorcery: boolean;
      /** <schema> Wording of this ability's Elder Sorcery incant */
      elderSorceryIncant: string;
    }
  }
}

export {};

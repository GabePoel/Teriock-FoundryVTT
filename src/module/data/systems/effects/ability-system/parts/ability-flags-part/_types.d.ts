declare global {
  namespace Teriock.Models {
    export interface AbilityFlagsPartInterface {
      /** <schema> If this is a basic ability */
      basic: boolean;
      /** <schema> What class this ability is associated with */
      class: Teriock.Parameters.Rank.RankClass;
      /** <schema> If this ability is consumable */
      consumable: boolean;
      /** <schema> If this ability is considered to be Elder Sorcery */
      elderSorcery: boolean;
      /** <schema> Wording of this ability's Elder Sorcery incant */
      elderSorceryIncant: string;
      /** <schema> If this ability is invoked */
      invoked: boolean;
      /** <schema> If this ability is a ritual */
      ritual: boolean;
      /** <schema> If this ability is a rotator */
      rotator: boolean;
      /** <schema> If this ability is considered a "skill" */
      skill: boolean;
      /** <schema> If this ability is a spell */
      spell: boolean;
      /** <schema> If this ability is considered "standard" */
      standard: boolean;
      /** <schema> If this ability is sustained */
      sustained: boolean;
      /** <schema> What consequences this ability is currently sustaining */
      sustaining: Set<UUID<TeriockConsequence>>;
      /** <schema> If this ability is automatically warded */
      warded: boolean;
    }
  }
}

export {};

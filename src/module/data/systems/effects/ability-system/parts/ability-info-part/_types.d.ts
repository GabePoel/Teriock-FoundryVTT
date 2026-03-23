declare global {
  namespace Teriock.Models {
    export type AbilityFlagsPartData = {
      /** <schema> If this is a basic ability */
      basic: boolean;
      /** <schema> What class this ability is associated with */
      class: Teriock.Keys.Class;
      /** <schema> If this ability is consumable */
      consumable: boolean;
      /** <schema> If this ability is a guildmaster ability */
      guildmaster: boolean;
      /** <schema> If this ability is invoked */
      invoked: boolean;
      /** <schema> If this ability is a lore ability */
      lore: boolean;
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
      /** <schema> If this ability is automatically warded */
      warded: boolean;
    };
  }
}

export {};

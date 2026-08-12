declare module "./identification-model.mjs" {
  export default interface IdentificationModel {
    /** <schema> Secret flaws for when this is identified */
    flaws: string;
    /** <schema> Is the equipment identified? */
    identified: boolean;
    /** <schema> Secret kind */
    kind: Teriock.Keys.EquipmentKind;
    /** <schema> Secret name for when this is identified */
    name: string;
    /** <schema> Secret notes for when this is identified */
    notes: string;
    /** <schema> Whether magic has been read on this */
    read: boolean;
  }
}

export {};

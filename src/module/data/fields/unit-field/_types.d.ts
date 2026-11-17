import BaseUnitModel from "../../models/unit-models/base-unit-model/base-unit-model.mjs";

declare module "./unit-field.mjs" {
  export default interface UnitField {
    model: typeof BaseUnitModel;
  }
}

export {};

import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

export default class TokenSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      autoColoration: new fields.BooleanField({
        label: "Automatic Coloration",
        initial: true,
        hint: "Automatically change this token's tint color when its actor is wounded.",
      }),
      autoDetectionModes: new fields.BooleanField({
        hint: "Automatically change this token's detection mode.",
        initial: true,
        label: "Automatic Detection Modes",
      }),
      autoLighting: new fields.BooleanField({
        label: "Automatic Lighting",
        initial: true,
        hint: "Automatically configure light emitted from this token.",
      }),
      autoMagic: new fields.BooleanField({
        label: "Automatic Effects",
        initial: true,
        hint: "Automatically apply Token Magic FX to this token for relevant conditions.",
      }),
      autoScale: new fields.BooleanField({
        label: "Automatic Scale",
        initial: true,
        hint: "Automatically scale this token to match its actor's size.",
      }),
      autoTransformation: new fields.BooleanField({
        label: "Automatic Transformation",
        initial: true,
        hint: "Automatically change this token when its actor is transformed.",
      }),
      autoVisionAngle: new fields.BooleanField({
        hint: "Automatically change this token's vision angle.",
        initial: true,
        label: "Automatic Vision Angle",
      }),
      autoVisionModes: new fields.BooleanField({
        label: "Automatic Vision Modes",
        initial: true,
        hint: "Automatically change this token's vision mode.",
      }),
      autoVisionRange: new fields.BooleanField({
        label: "Automatic Vision Range",
        initial: true,
        hint: "Automatically change this token's vision range.",
      }),
    });
    return schema;
  }
}

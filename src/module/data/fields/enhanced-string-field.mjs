import { IconFieldMixin } from "./_module.mjs";

const { StringField } = foundry.data.fields;

/**
 * @extends {StringField}
 * @mixes IconField
 */
export default class EnhancedStringField extends IconFieldMixin(StringField) {}

import { IconFieldMixin } from "./_module.mjs";

const { NumberField } = foundry.data.fields;

/**
 * @extends {NumberField}
 * @mixes IconField
 */
export default class EnhancedNumberField extends IconFieldMixin(NumberField) {}

import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TokenConfig } = foundry.applications.sheets;

/**
 * @extends {TokenConfig}
 * @extends {TeriockDocumentSheet}
 * @mixes ConfigButtonSheet
 */
export default class BaseTokenSheet extends mix(
  TokenConfig,
  mixins.ConfigButtonSheetMixin,
) {}

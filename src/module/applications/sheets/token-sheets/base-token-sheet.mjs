import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseApplicationMixin } from "../../shared/mixins/_module.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TokenConfig } = foundry.applications.sheets;

/**
 * @extends {TokenConfig}
 * @extends {TeriockDocumentSheet}
 * @mixes ConfigButtonSheet
 */
export default class BaseTokenSheet extends mixClasses(
  TokenConfig,
  BaseApplicationMixin,
  mixins.ConfigButtonSheetMixin,
) {}

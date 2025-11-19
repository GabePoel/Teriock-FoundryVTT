import { BaseDocumentMixin } from "./documents/mixins/_module.mjs";

const { Canvas } = foundry.canvas;

/**
 * @extends {Canvas}
 * @mixes BaseDocument
 * @property {object} teriock
 * @property {Readonly<TeriockScene>} scene
 * @property {ControlsLayer} controls
 * @property {DrawingsLayer} drawings
 * @property {LightingLayer} lighting
 * @property {NotesLayer} notes
 * @property {RegionLayer} regions
 * @property {SoundsLayer} sounds
 * @property {TemplateLayer} templates
 * @property {TilesLayer} tiles
 * @property {TokenLayer} tokens
 * @property {WallsLayer} walls
 * @property {WeatherEffects} weather
 */
export default class TeriockCanvas extends BaseDocumentMixin(Canvas) {}

import { preLocalizeObject } from "../../helpers/localization.mjs";
import { thumbnails } from "../display/_module.mjs";

/**
 * @enum {Teriock.Config.TerrainEntry}
 * @category Terrain
 */
// no sort
const terrainConfig = {
  aquatic: { img: thumbnails.manifest.ability.waterNative, label: "TERIOCK.TERRAIN.aquatic" },
  coastal: { img: thumbnails.manifest.ability.coastNative, label: "TERIOCK.TERRAIN.coastal" },
  desert: { img: thumbnails.manifest.ability.desertNative, label: "TERIOCK.TERRAIN.desert" },
  forest: { img: thumbnails.manifest.ability.forestNative, label: "TERIOCK.TERRAIN.forest" },
  frozen: { img: thumbnails.manifest.ability.snowNative, label: "TERIOCK.TERRAIN.frozen" },
  fungal: { img: thumbnails.manifest.ability.fungusNative, label: "TERIOCK.TERRAIN.fungal" },
  highlands: { img: thumbnails.manifest.ability.hillNative, label: "TERIOCK.TERRAIN.highland" },
  jungle: { img: thumbnails.manifest.ability.jungleNative, label: "TERIOCK.TERRAIN.jungle" },
  mountain: { img: thumbnails.manifest.ability.mountainNative, label: "TERIOCK.TERRAIN.mountain" },
  ocean: { img: thumbnails.manifest.ability.seaActive, label: "TERIOCK.TERRAIN.ocean" },
  plains: { img: thumbnails.manifest.ability.plainsNative, label: "TERIOCK.TERRAIN.plains" },
  sky: { img: thumbnails.manifest.ability.skyNative, label: "TERIOCK.TERRAIN.sky" },
  swamp: { img: thumbnails.manifest.ability.swampNative, label: "TERIOCK.TERRAIN.swamp" },
  underground: { img: thumbnails.manifest.ability.earthNative, label: "TERIOCK.TERRAIN.underground" },
  urban: { img: thumbnails.manifest.ability.cityNative, label: "TERIOCK.TERRAIN.urban" },
  volcanic: { img: thumbnails.manifest.ability.volcanoNative, label: "TERIOCK.TERRAIN.volcanic" },
  wasteland: { img: thumbnails.manifest.ability.wastelandNative, label: "TERIOCK.TERRAIN.wasteland" },
};

export default terrainConfig;

preLocalizeObject("CONFIG.terrain", { keys: ["label"] });

import "./identification-model/_types";
import "./modifier-models/_types";
import "./stat-die-model/_types";
import "./stat-pool-models/_types";
import "./storage-model/_types";

declare global {
  namespace Teriock.Models {
    export interface ScaleModelInterface {
      raw: number;
    }
  }
}

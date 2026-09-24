import fallback from "@/assets/vial.jpg";
import retatrutide from "@/assets/vials/retatrutide.jpg";
import bpc157 from "@/assets/vials/bpc-157.jpg";
import kpv from "@/assets/vials/kpv.jpg";
import ghkCu from "@/assets/vials/ghk-cu.jpg";
import glowBlend from "@/assets/vials/glow-blend.jpg";
import motsC from "@/assets/vials/mots-c.jpg";
import klowBlend from "@/assets/vials/klow-blend.jpg";
import cjcIpamorelin from "@/assets/vials/cjc-ipamorelin.jpg";
import tesamorelin from "@/assets/vials/tesamorelin.jpg";
import tb500 from "@/assets/vials/tb-500.jpg";
import semax from "@/assets/vials/semax.jpg";
import selank from "@/assets/vials/selank.jpg";
import bacWater from "@/assets/vials/bac-water.jpg";
import semaglutide from "@/assets/vials/semaglutide.jpg";
import tirzepatide from "@/assets/vials/tirzepatide.jpg";
import cjcDac from "@/assets/vials/cjc-dac.jpg";
import melanotan2 from "@/assets/vials/melanotan-2.jpg";
import pt141 from "@/assets/vials/pt-141.jpg";
import bpcTbBlend from "@/assets/vials/bpc-tb-blend.jpg";
import syringes from "@/assets/vials/syringes.jpg";

const images: Record<string, string> = {
  retatrutide,
  "bpc-157": bpc157,
  kpv,
  "ghk-cu": ghkCu,
  "glow-blend": glowBlend,
  "mots-c": motsC,
  "klow-blend": klowBlend,
  "cjc-ipamorelin": cjcIpamorelin,
  tesamorelin,
  "tb-500": tb500,
  semax,
  selank,
  "bac-water": bacWater,
  syringes,
  "semaglutide": semaglutide,
  "tirzepatide": tirzepatide,
  "cjc-dac": cjcDac,
  "melanotan-2": melanotan2,
  "pt-141": pt141,
  "bpc-tb-blend": bpcTbBlend,
};

export const vialImage = (slug: string) => images[slug] ?? fallback;

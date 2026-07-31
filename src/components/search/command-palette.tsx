/**
 * Project 075 — Command Palette entry aliases.
 * Implementation lives in Universal Search (reuse, no second engine).
 */

export {
  UniversalSearchProvider as CommandPaletteProvider,
  useUniversalSearch as useCommandPalette,
  useUniversalSearchOptional as useCommandPaletteOptional,
} from "@/components/search/universal-search-provider";

export {
  UniversalSearchDialog as CommandPaletteDialog,
} from "@/components/search/universal-search-dialog";

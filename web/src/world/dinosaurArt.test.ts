import { describe, expect, it } from "vitest";
import {
  PREMIUM_DINOSAUR_SPECIES,
  dinosaurOverlookArtStyle,
  dinosaurSpeciesArtStyle,
  fossilExpeditionArtStyle,
} from "./dinosaurArt";

describe("premium Dinosaur Valley art atlases", () => {
  it("maps every saved dinosaur species to one stable portrait cell", () => {
    expect(PREMIUM_DINOSAUR_SPECIES).toEqual([
      "trex",
      "triceratops",
      "stegosaurus",
      "brachiosaurus",
      "ankylosaurus",
      "velociraptor",
    ]);
    expect(dinosaurSpeciesArtStyle("trex")).toMatchObject({ "--dinosaur-species-position": "0% 0%" });
    expect(dinosaurSpeciesArtStyle("triceratops")).toMatchObject({ "--dinosaur-species-position": "100% 0%" });
    expect(dinosaurSpeciesArtStyle("brachiosaurus")).toMatchObject({ "--dinosaur-species-position": "100% 50%" });
    expect(dinosaurSpeciesArtStyle("velociraptor")).toMatchObject({ "--dinosaur-species-position": "100% 100%" });
    expect(dinosaurSpeciesArtStyle("unknown")).toMatchObject({ "--dinosaur-species-position": "0% 0%" });
  });

  it("maps observation and fossil stages to deterministic two-by-two cells", () => {
    expect(dinosaurOverlookArtStyle(0)).toMatchObject({ "--dinosaur-scene-position": "0% 0%" });
    expect(dinosaurOverlookArtStyle(1)).toMatchObject({ "--dinosaur-scene-position": "100% 0%" });
    expect(dinosaurOverlookArtStyle(2)).toMatchObject({ "--dinosaur-scene-position": "0% 100%" });
    expect(dinosaurOverlookArtStyle(99)).toMatchObject({ "--dinosaur-scene-position": "100% 100%" });
    expect(fossilExpeditionArtStyle("survey")).toMatchObject({ "--dinosaur-scene-position": "0% 0%" });
    expect(fossilExpeditionArtStyle("brush")).toMatchObject({ "--dinosaur-scene-position": "100% 0%" });
    expect(fossilExpeditionArtStyle("classify")).toMatchObject({ "--dinosaur-scene-position": "0% 100%" });
    expect(fossilExpeditionArtStyle("complete")).toMatchObject({ "--dinosaur-scene-position": "100% 100%" });
  });
});

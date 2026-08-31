import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AnimalRecord, DinosaurRecord } from "../types";
import { DinosaurArt } from "./DinosaurArt";
import { LocalWildlifeArt } from "./LocalWildlifeArt";

const animal: AnimalRecord = {
  id: "jaguar",
  name: "Jaguar",
  habitat: "Rainforest",
  emoji: "🐆",
  fact: "Jaguars are powerful swimmers.",
  discovered: true,
  favorite: false,
};

const dinosaur = (id: string, name: string, period: string): DinosaurRecord => ({
  id,
  name,
  period,
  emoji: "🦖",
  discovered: true,
});

describe("local media artwork", () => {
  it("always renders a named local wildlife illustration without a network response", () => {
    const html = renderToStaticMarkup(<LocalWildlifeArt animal={animal} displayName="Jaguar" language="en" />);
    expect(html).toContain("Jaguar");
    expect(html).toContain("Local illustration");
    expect(html).toContain("local-wildlife-art__animal");
  });

  it("renders distinct premium local atlas portraits for every supported dinosaur", () => {
    const trex = renderToStaticMarkup(<DinosaurArt dinosaur={dinosaur("trex", "Tyrannosaurus rex", "Cretaceous")} language="en" />);
    const stegosaurus = renderToStaticMarkup(<DinosaurArt dinosaur={dinosaur("stegosaurus", "Stegosaurus", "Jurassic")} language="en" />);
    expect(trex).toContain("Tyrannosaurus rex");
    expect(stegosaurus).toContain("Stegosaurus");
    expect(trex).not.toBe(stegosaurus);
    expect(trex).toContain("premium-dinosaur-species-atlas");
    expect(trex).toContain('data-dinosaur-art="trex"');
    expect(stegosaurus).toContain('data-dinosaur-art="stegosaurus"');
    expect(trex).not.toContain("<svg");
    expect(trex).not.toContain("<canvas");
  });

  it("keeps undiscovered dinosaurs illustrated but visually protected", () => {
    const html = renderToStaticMarkup(<DinosaurArt dinosaur={dinosaur("triceratops", "Triceratops", "Cretaceous")} language="es-MX" discovered={false} />);
    expect(html).toContain("is-mystery");
    expect(html).toContain("Dinosaurio misterioso");
  });
});

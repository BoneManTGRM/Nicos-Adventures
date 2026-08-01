"""Dinosaur Valley catalog and deterministic field challenges."""

from __future__ import annotations

import random
from typing import Any

DINOSAURS: dict[str, dict[str, str]] = {
    "triceratops": {
        "name": "Triceratops",
        "emoji": "🦕",
        "period": "Late Cretaceous",
        "diet": "Herbivore",
        "habitat": "Open woodlands",
        "fact": "It had three horns and a broad neck frill.",
        "fossil": "Triceratops frill fragment",
        "ability": "strength",
    },
    "tyrannosaurus": {
        "name": "Tyrannosaurus rex",
        "emoji": "🦖",
        "period": "Late Cretaceous",
        "diet": "Carnivore",
        "habitat": "River valleys",
        "fact": "Its powerful bite was among the strongest of land animals.",
        "fossil": "T. rex tooth cast",
        "ability": "scanner",
    },
    "brachiosaurus": {
        "name": "Brachiosaurus",
        "emoji": "🦕",
        "period": "Late Jurassic",
        "diet": "Herbivore",
        "habitat": "Warm floodplains",
        "fact": "Its long front legs held its shoulders higher than its hips.",
        "fossil": "Brachiosaurus vertebra model",
        "ability": "repair",
    },
    "stegosaurus": {
        "name": "Stegosaurus",
        "emoji": "🦕",
        "period": "Late Jurassic",
        "diet": "Herbivore",
        "habitat": "Fern-covered plains",
        "fact": "Rows of plates ran along its back and spikes protected its tail.",
        "fossil": "Stegosaurus plate impression",
        "ability": "strength",
    },
    "velociraptor": {
        "name": "Velociraptor",
        "emoji": "🦖",
        "period": "Late Cretaceous",
        "diet": "Carnivore",
        "habitat": "Dry dune fields",
        "fact": "It was feathered and much smaller than many movie versions.",
        "fossil": "Velociraptor claw replica",
        "ability": "scanner",
    },
    "ankylosaurus": {
        "name": "Ankylosaurus",
        "emoji": "🦕",
        "period": "Late Cretaceous",
        "diet": "Herbivore",
        "habitat": "Wooded plains",
        "fact": "Bony armor protected its body and its tail ended in a club.",
        "fossil": "Ankylosaurus armor tile",
        "ability": "strength",
    },
    "parasaurolophus": {
        "name": "Parasaurolophus",
        "emoji": "🦕",
        "period": "Late Cretaceous",
        "diet": "Herbivore",
        "habitat": "Coastal lowlands",
        "fact": "Its long crest may have helped it make resonant calls.",
        "fossil": "Parasaurolophus crest scan",
        "ability": "translator",
    },
    "pteranodon": {
        "name": "Pteranodon",
        "emoji": "🪽",
        "period": "Late Cretaceous",
        "diet": "Fish eater",
        "habitat": "Coastal skies",
        "fact": "It was a flying reptile, not technically a dinosaur.",
        "fossil": "Pteranodon wing-bone model",
        "ability": "flight",
    },
    "spinosaurus": {
        "name": "Spinosaurus",
        "emoji": "🦖",
        "period": "Late Cretaceous",
        "diet": "Fish and meat",
        "habitat": "River systems",
        "fact": "Its body had adaptations suited to spending time in water.",
        "fossil": "Spinosaurus sail-spine cast",
        "ability": "aquatic",
    },
    "iguanodon": {
        "name": "Iguanodon",
        "emoji": "🦕",
        "period": "Early Cretaceous",
        "diet": "Herbivore",
        "habitat": "Forests and floodplains",
        "fact": "A large thumb spike may have helped with defense or feeding.",
        "fossil": "Iguanodon thumb-spike replica",
        "ability": "repair",
    },
    "microraptor": {
        "name": "Microraptor",
        "emoji": "🪶",
        "period": "Early Cretaceous",
        "diet": "Small animals",
        "habitat": "Forests",
        "fact": "Long feathers on all four limbs helped it glide.",
        "fossil": "Microraptor feather impression",
        "ability": "flight",
    },
    "mosasaurus": {
        "name": "Mosasaurus",
        "emoji": "🌊",
        "period": "Late Cretaceous",
        "diet": "Marine predator",
        "habitat": "Ancient oceans",
        "fact": "It was a giant marine reptile related to modern lizards.",
        "fossil": "Mosasaurus jaw fragment model",
        "ability": "aquatic",
    },
}


def dinosaur_round(seed: int | str) -> dict[str, Any]:
    rng = random.Random(seed)
    dinosaur_id = rng.choice(tuple(DINOSAURS))
    dinosaur = DINOSAURS[dinosaur_id]
    wrong = [
        item["name"]
        for key, item in DINOSAURS.items()
        if key != dinosaur_id
    ]
    options = rng.sample(wrong, 3) + [dinosaur["name"]]
    rng.shuffle(options)
    return {
        "dinosaur_id": dinosaur_id,
        "prompt": dinosaur["fact"],
        "answer": dinosaur["name"],
        "options": options,
    }

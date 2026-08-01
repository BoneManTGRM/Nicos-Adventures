"""Additional balanced wildlife for Animal Forest."""

from __future__ import annotations

from core import animal_photos, animal_world

_EXTRA_RECORDS: tuple[tuple[str, ...], ...] = (
    ('Harpy Eagle', '🦅', 'Rainforest', 'Carnivore', 'Bird', 'Central and South America',
     'Harpy eagles have enormous talons that help them catch animals high in the canopy.',
     'Broad wings and a long tail provide control between crowded trees.',
     'Find a powerful bird that hunts beneath the rainforest roof.'),
    ("Baird's Tapir", '🐗', 'Rainforest', 'Herbivore', 'Mammal', 'Mexico and Central America',
     "Baird's tapirs spread seeds as they travel through tropical forests.",
     'A flexible, trunk-like snout gathers leaves and works like a snorkel in water.',
     'Find a large seed-spreading mammal from Mexico.'),
    ('Howler Monkey', '🐒', 'Rainforest', 'Herbivore', 'Mammal', 'Central and South America',
     'Howler monkey calls can carry for several kilometers through the forest.',
     'An enlarged throat chamber turns a small body into a powerful sound system.',
     'Find one of the loudest land animals.'),
    ('Leafcutter Ant', '🐜', 'Rainforest', 'Fungivore', 'Insect', 'The Americas',
     'Leafcutter ants use pieces of leaves to grow fungus for food.',
     'Large colonies divide jobs among workers of different sizes.',
     'Find an insect that farms its own food.'),
    ('Vaquita', '🐬', 'Ocean', 'Carnivore', 'Mammal', 'Gulf of California, Mexico',
     'The vaquita lives only in the northern Gulf of California.',
     'Sensitive echolocation helps it navigate cloudy coastal water.',
     "Find Mexico's tiny and extremely rare porpoise."),
    ('Whale Shark', '🦈', 'Ocean', 'Planktivore', 'Fish', 'Warm oceans worldwide',
     'The whale shark is the largest fish in the world.',
     'A huge mouth filters plankton while the shark swims slowly forward.',
     'Find a gentle shark that eats tiny drifting food.'),
    ('Sea Otter', '🦦', 'Ocean', 'Carnivore', 'Mammal', 'North Pacific',
     'Sea otters use rocks as tools to open hard-shelled prey.',
     'The densest fur of any mammal traps warm air beside the skin.',
     'Find a marine mammal that carries a favorite tool.'),
    ('Seahorse', '🐠', 'Ocean', 'Carnivore', 'Fish', 'Shallow oceans worldwide',
     'Male seahorses carry developing young in a pouch.',
     'A curling tail grips seagrass so currents do not sweep it away.',
     'Find a fish whose father carries the babies.'),
    ('Cheetah', '🐆', 'Savanna', 'Carnivore', 'Mammal', 'Africa',
     'Cheetahs are the fastest land animals over short distances.',
     'A flexible spine, long legs, and gripping claws create explosive speed.',
     'Find the fastest runner on land.'),
    ('Plains Zebra', '🦓', 'Savanna', 'Herbivore', 'Mammal', 'Eastern and southern Africa',
     'Every zebra has a stripe pattern as individual as a fingerprint.',
     'Strong social groups watch for danger while members graze.',
     'Find an animal whose stripes are never exactly repeated.'),
    ('Ostrich', '🪶', 'Savanna', 'Omnivore', 'Bird', 'Africa',
     "The ostrich is the world's largest living bird.",
     'Powerful two-toed legs make it a very fast runner.',
     'Find a bird that runs instead of flying.'),
    ('African Wild Dog', '🐕', 'Savanna', 'Carnivore', 'Mammal', 'Sub-Saharan Africa',
     'African wild dogs cooperate closely when hunting and caring for pups.',
     'Long legs and great endurance help the pack travel far.',
     'Find a team-working hunter with a patchy coat.'),
    ('Narwhal', '🐋', 'Arctic', 'Carnivore', 'Mammal', 'Arctic seas',
     "A narwhal's famous tusk is actually a long spiral tooth.",
     'A thick layer of blubber stores energy and blocks icy water.',
     'Find the whale sometimes called the unicorn of the sea.'),
    ('Musk Ox', '🐂', 'Arctic', 'Herbivore', 'Mammal', 'Arctic tundra',
     'Musk oxen grow an extremely warm undercoat called qiviut.',
     'The herd forms a defensive ring around calves when threatened.',
     'Find an Arctic animal that protects young in a circle.'),
    ('Snowy Owl', '🦉', 'Arctic', 'Carnivore', 'Bird', 'Arctic tundra',
     'Snowy owls often hunt during daylight in the bright Arctic summer.',
     'Feathers cover even their feet to reduce heat loss.',
     'Find a white owl that can hunt under the midnight sun.'),
    ('Leopard Seal', '🦭', 'Arctic', 'Carnivore', 'Mammal', 'Antarctic waters',
     'Leopard seals make complex underwater calls during breeding season.',
     'A long, streamlined body and powerful front flippers create fast turns.',
     'Find a spotted polar seal built for speed.'),
    ('Kangaroo Rat', '🐭', 'Desert', 'Herbivore', 'Mammal', 'North America',
     'Kangaroo rats get nearly all the water they need from dry seeds.',
     'Powerful hind legs launch sudden jumps away from predators.',
     'Find a tiny desert mammal that rarely needs to drink.'),
    ('Desert Tortoise', '🐢', 'Desert', 'Herbivore', 'Reptile', 'North America',
     'Desert tortoises spend much of the year inside cool underground burrows.',
     'Their bodies can store water for long dry periods.',
     'Find a slow reptile that escapes heat underground.'),
    ('Thorny Devil', '🦎', 'Desert', 'Carnivore', 'Reptile', 'Australia',
     "Grooves between a thorny devil's scales move water toward its mouth.",
     'Spines, camouflage, and a false head help confuse predators.',
     'Find a lizard that drinks through channels in its skin.'),
    ('Sidewinder Rattlesnake', '🐍', 'Desert', 'Carnivore', 'Reptile', 'North America',
     'The sidewinder leaves a series of J-shaped tracks in loose sand.',
     'Sideways movement keeps only a small part of the body on hot ground.',
     'Find a snake that travels sideways.'),
    ('Monarch Butterfly', '🦋', 'Forest', 'Herbivore', 'Insect', 'North America and Mexico',
     'Millions of monarch butterflies spend winter in mountain forests in Mexico.',
     'Several generations complete one enormous migration cycle.',
     'Find an insect that travels across a continent.'),
    ('American Black Bear', '🐻', 'Forest', 'Omnivore', 'Mammal', 'North America',
     'Black bears are strong climbers and can remember reliable food locations.',
     'Curved claws help them climb trees and tear open logs.',
     'Find a large forest animal that climbs surprisingly well.'),
    ('Pileated Woodpecker', '🐦', 'Forest', 'Omnivore', 'Bird', 'North America',
     'Pileated woodpeckers carve large rectangular holes while searching for insects.',
     'A reinforced skull and shock-absorbing tissues protect the brain while pecking.',
     'Find a bird that works like a forest carpenter.'),
    ('Mexican Gray Wolf', '🐺', 'Forest', 'Carnivore', 'Mammal',
     'Northern Mexico and the southwestern United States',
     'Mexican gray wolves live in family groups and communicate with howls.',
     'Long legs and efficient movement help packs patrol large territories.',
     'Find a rare wolf native to Mexico.'),
    ('West Indian Manatee', '🦭', 'Wetlands', 'Herbivore', 'Mammal',
     'Caribbean, Gulf of Mexico, and Atlantic rivers',
     'Manatees are gentle plant-eaters related to elephants.',
     'Dense bones help control buoyancy while grazing underwater.',
     'Find a slow-moving mammal sometimes called a sea cow.'),
    ('American Alligator', '🐊', 'Wetlands', 'Carnivore', 'Reptile',
     'Southeastern United States',
     'Alligator-made water holes can shelter many wetland animals during dry weather.',
     'Eyes and nostrils on top of the head allow nearly hidden swimming.',
     'Find a reptile that creates habitat for other species.'),
    ('Shoebill', '🦤', 'Wetlands', 'Carnivore', 'Bird', 'East and central Africa',
     'Shoebills can stand almost motionless while waiting for fish.',
     'A huge hooked bill grabs slippery prey in thick marsh plants.',
     'Find a patient bird with a shoe-shaped bill.'),
    ('North American River Otter', '🦦', 'Wetlands', 'Carnivore', 'Mammal', 'North America',
     'River otters slide on mud and snow as both play and efficient travel.',
     'Closable ears and nostrils keep water out during dives.',
     'Find a playful swimmer with waterproof fur.'),
    ('Golden Eagle', '🦅', 'Mountains', 'Carnivore', 'Bird', 'Northern Hemisphere',
     'Golden eagles can spot small prey from very high above the ground.',
     'Broad wings use mountain updrafts to soar with little effort.',
     'Find a mountain hunter with exceptional eyesight.'),
    ('American Pika', '🐹', 'Mountains', 'Herbivore', 'Mammal', 'Western North America',
     'Pikas gather summer plants into hay piles for winter food.',
     'A compact body and thick fur conserve heat among cold rocks.',
     'Find a tiny mammal that makes its own haystack.'),
    ('Alpine Ibex', '🐐', 'Mountains', 'Herbivore', 'Mammal', 'European Alps',
     'Alpine ibex can balance on extremely narrow rocky ledges.',
     'Hooves have hard rims for edges and soft centers for grip.',
     'Find a goat with built-in climbing boots.'),
    ('Vicuña', '🦙', 'Mountains', 'Herbivore', 'Mammal', 'Andes of South America',
     'Vicuñas produce exceptionally fine wool while living high in the Andes.',
     'Efficient blood and large lungs help them use thin mountain air.',
     'Find a wild relative of the llama adapted to high altitude.'),
)

PHOTO_TITLE_OVERRIDES: dict[str, str] = {
    "Baird's Tapir": "Baird's tapir",
    'Leafcutter Ant': 'Leafcutter ant',
    'Whale Shark': 'Whale shark',
    'Sea Otter': 'Sea otter',
    'Plains Zebra': 'Plains zebra',
    'African Wild Dog': 'African wild dog',
    'Musk Ox': 'Muskox',
    'Leopard Seal': 'Leopard seal',
    'Kangaroo Rat': 'Kangaroo rat',
    'Desert Tortoise': 'Desert tortoise',
    'Thorny Devil': 'Thorny devil',
    'Sidewinder Rattlesnake': 'Crotalus cerastes',
    'Monarch Butterfly': 'Monarch butterfly',
    'American Black Bear': 'American black bear',
    'Pileated Woodpecker': 'Pileated woodpecker',
    'Mexican Gray Wolf': 'Mexican wolf',
    'West Indian Manatee': 'West Indian manatee',
    'American Alligator': 'American alligator',
    'North American River Otter': 'North American river otter',
    'American Pika': 'American pika',
    'Alpine Ibex': 'Alpine ibex',
}


def _animal(record: tuple[str, ...]) -> dict[str, str]:
    (
        name,
        emoji,
        habitat,
        diet,
        group,
        region,
        fact,
        adaptation,
        mission,
    ) = record
    return {
        'name': name,
        'emoji': emoji,
        'habitat': habitat,
        'diet': diet,
        'group': group,
        'region': region,
        'fact': fact,
        'adaptation': adaptation,
        'mission': mission,
    }


EXTRA_ANIMALS: tuple[dict[str, str], ...] = tuple(
    _animal(record)
    for record in _EXTRA_RECORDS
)


def install_animal_expansion() -> int:
    """Install each extra animal once and return the total built-in count."""
    existing = {
        str(animal.get('name', '')).casefold()
        for animal in animal_world.ANIMAL_LIBRARY
    }
    additions = tuple(
        dict(animal)
        for animal in EXTRA_ANIMALS
        if animal['name'].casefold() not in existing
    )
    if additions:
        animal_world.ANIMAL_LIBRARY = (
            *animal_world.ANIMAL_LIBRARY,
            *additions,
        )
    animal_photos.ARTICLE_OVERRIDES.update(PHOTO_TITLE_OVERRIDES)
    return len(animal_world.ANIMAL_LIBRARY)

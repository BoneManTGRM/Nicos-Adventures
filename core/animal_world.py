"""Pure Animal Forest data and gameplay helpers."""

from __future__ import annotations

import random
from typing import Any, Iterable

HABITATS: dict[str, tuple[str, str]] = {
    "Rainforest": ("🌴", "Warm, wet forests filled with layers of life."),
    "Ocean": ("🌊", "Saltwater worlds from sunny reefs to the deep sea."),
    "Savanna": ("🌾", "Open grasslands with scattered trees and large herds."),
    "Arctic": ("❄️", "Frozen lands and seas where animals conserve heat."),
    "Desert": ("🏜️", "Dry places where animals avoid heat and save water."),
    "Forest": ("🌲", "Woodlands with trees, burrows, streams, and changing seasons."),
    "Wetlands": ("🪷", "Marshes, lakes, and riverbanks rich with food and shelter."),
    "Mountains": ("🏔️", "High, rocky habitats with thin air and steep slopes."),
}

ANIMAL_LIBRARY: tuple[dict[str, str], ...] = (
    {"name":"Jaguar","emoji":"🐆","habitat":"Rainforest","diet":"Carnivore","group":"Mammal","region":"Central and South America","fact":"Jaguars are powerful swimmers and can bite through turtle shells.","adaptation":"Spotted fur helps them disappear in broken forest light.","mission":"Find an animal whose camouflage helps it hunt."},
    {"name":"Toucan","emoji":"🦜","habitat":"Rainforest","diet":"Omnivore","group":"Bird","region":"Central and South America","fact":"A toucan's huge bill is surprisingly light because it is filled with air spaces.","adaptation":"Its long bill reaches fruit on branches too thin to stand on.","mission":"Find a bird with a tool-like beak."},
    {"name":"Sloth","emoji":"🦥","habitat":"Rainforest","diet":"Herbivore","group":"Mammal","region":"Central and South America","fact":"Sloths can hold their breath longer than many dolphins.","adaptation":"Moving slowly saves energy on a low-calorie leaf diet.","mission":"Find an animal that saves energy by moving slowly."},
    {"name":"Poison Dart Frog","emoji":"🐸","habitat":"Rainforest","diet":"Carnivore","group":"Amphibian","region":"Central and South America","fact":"Some poison dart frogs carry tadpoles on their backs.","adaptation":"Bright colors warn predators to stay away.","mission":"Find an animal that uses warning colors."},
    {"name":"Blue Whale","emoji":"🐋","habitat":"Ocean","diet":"Carnivore","group":"Mammal","region":"Worldwide oceans","fact":"A blue whale is the largest animal known to have lived on Earth.","adaptation":"Baleen plates filter tiny krill from enormous mouthfuls of water.","mission":"Find the largest animal in the forest library."},
    {"name":"Giant Pacific Octopus","emoji":"🐙","habitat":"Ocean","diet":"Carnivore","group":"Mollusk","region":"North Pacific","fact":"An octopus has three hearts and blue blood.","adaptation":"It can change color and texture to hide almost instantly.","mission":"Find an animal with three hearts."},
    {"name":"Sea Turtle","emoji":"🐢","habitat":"Ocean","diet":"Omnivore","group":"Reptile","region":"Warm oceans","fact":"Female sea turtles often return to the beach where they hatched.","adaptation":"Long front flippers carry them across entire oceans.","mission":"Find a reptile that travels thousands of miles."},
    {"name":"Manta Ray","emoji":"🐟","habitat":"Ocean","diet":"Carnivore","group":"Fish","region":"Tropical oceans","fact":"Manta rays can recognize themselves in a mirror.","adaptation":"Wide fins let them glide efficiently while filtering plankton.","mission":"Find a fish that seems to fly underwater."},
    {"name":"Lion","emoji":"🦁","habitat":"Savanna","diet":"Carnivore","group":"Mammal","region":"Africa","fact":"Lion prides cooperate to guard territory and raise cubs.","adaptation":"A rough tongue helps scrape meat from bones.","mission":"Find a social cat that lives in a group."},
    {"name":"African Elephant","emoji":"🐘","habitat":"Savanna","diet":"Herbivore","group":"Mammal","region":"Africa","fact":"Elephants communicate using low rumbles that travel through the ground.","adaptation":"Large ears release heat like giant cooling fans.","mission":"Find an animal that can hear through its feet."},
    {"name":"Giraffe","emoji":"🦒","habitat":"Savanna","diet":"Herbivore","group":"Mammal","region":"Africa","fact":"Giraffes have the same number of neck bones as people: seven.","adaptation":"A long neck and tongue reach leaves other animals cannot.","mission":"Find the tallest land animal."},
    {"name":"Meerkat","emoji":"🐾","habitat":"Savanna","diet":"Omnivore","group":"Mammal","region":"Southern Africa","fact":"One meerkat often stands guard while the rest search for food.","adaptation":"Dark patches around the eyes reduce sun glare.","mission":"Find an animal that uses a lookout system."},
    {"name":"Polar Bear","emoji":"🐻‍❄️","habitat":"Arctic","diet":"Carnivore","group":"Mammal","region":"Arctic Ocean","fact":"Polar bear skin is black beneath its clear-looking fur.","adaptation":"Thick fat and hollow fur trap heat in freezing weather.","mission":"Find an animal whose skin and fur work together to keep it warm."},
    {"name":"Arctic Fox","emoji":"🦊","habitat":"Arctic","diet":"Omnivore","group":"Mammal","region":"Arctic tundra","fact":"Arctic foxes can hear small animals moving beneath snow.","adaptation":"Their coat changes color with the seasons.","mission":"Find an animal that changes coat color."},
    {"name":"Emperor Penguin","emoji":"🐧","habitat":"Arctic","diet":"Carnivore","group":"Bird","region":"Antarctica","fact":"Emperor penguin fathers balance eggs on their feet through winter.","adaptation":"Groups huddle and rotate positions to share warmth.","mission":"Find a bird that cannot fly but dives deeply."},
    {"name":"Walrus","emoji":"🦭","habitat":"Arctic","diet":"Carnivore","group":"Mammal","region":"Arctic seas","fact":"Walruses use sensitive whiskers to find clams on dark seafloors.","adaptation":"Tusks help pull their heavy bodies onto ice.","mission":"Find an animal that uses whiskers to search underwater."},
    {"name":"Fennec Fox","emoji":"🦊","habitat":"Desert","diet":"Omnivore","group":"Mammal","region":"Sahara Desert","fact":"Fennec foxes can hear prey moving underground.","adaptation":"Huge ears release heat and detect quiet sounds.","mission":"Find the animal with the biggest ears for its body size."},
    {"name":"Camel","emoji":"🐫","habitat":"Desert","diet":"Herbivore","group":"Mammal","region":"Africa and Asia","fact":"Camel humps store fat, not water.","adaptation":"Closing nostrils and double eyelashes block blowing sand.","mission":"Find an animal built for sandstorms."},
    {"name":"Roadrunner","emoji":"🐦","habitat":"Desert","diet":"Omnivore","group":"Bird","region":"North America","fact":"Roadrunners can run fast enough to catch rattlesnakes.","adaptation":"Long legs and a balancing tail help with sudden turns.","mission":"Find a desert bird that prefers running."},
    {"name":"Gila Monster","emoji":"🦎","habitat":"Desert","diet":"Carnivore","group":"Reptile","region":"North America","fact":"Gila monsters may eat only a few large meals each year.","adaptation":"Fat stored in the tail helps them survive scarce food.","mission":"Find a venomous lizard."},
    {"name":"Red Panda","emoji":"🐾","habitat":"Forest","diet":"Omnivore","group":"Mammal","region":"Himalayan forests","fact":"Red pandas wrap their fluffy tails around themselves like blankets.","adaptation":"A false thumb helps grip bamboo.","mission":"Find an animal with an extra gripping thumb."},
    {"name":"Flying Squirrel","emoji":"🐿️","habitat":"Forest","diet":"Omnivore","group":"Mammal","region":"Forests worldwide","fact":"Flying squirrels glide rather than truly fly.","adaptation":"A skin membrane works like a controllable parachute.","mission":"Find a mammal that glides between trees."},
    {"name":"Great Horned Owl","emoji":"🦉","habitat":"Forest","diet":"Carnivore","group":"Bird","region":"The Americas","fact":"Owls can turn their heads far because extra neck bones protect blood flow.","adaptation":"Soft-edged feathers make flight nearly silent.","mission":"Find a silent nighttime hunter."},
    {"name":"Beaver","emoji":"🦫","habitat":"Forest","diet":"Herbivore","group":"Mammal","region":"North America and Europe","fact":"Beaver dams create wetlands used by many other species.","adaptation":"Transparent eyelids work like swimming goggles.","mission":"Find an ecosystem engineer."},
    {"name":"Axolotl","emoji":"🦎","habitat":"Wetlands","diet":"Carnivore","group":"Amphibian","region":"Mexico","fact":"Axolotls can regrow limbs and parts of several organs.","adaptation":"Feathery external gills gather oxygen underwater.","mission":"Find a Mexican amphibian that stays aquatic as an adult."},
    {"name":"Capybara","emoji":"🦫","habitat":"Wetlands","diet":"Herbivore","group":"Mammal","region":"South America","fact":"Capybaras are the world's largest rodents.","adaptation":"Eyes, ears, and nostrils sit high on the head for swimming.","mission":"Find the largest rodent."},
    {"name":"Flamingo","emoji":"🦩","habitat":"Wetlands","diet":"Omnivore","group":"Bird","region":"Africa, Asia, Europe, and the Americas","fact":"Flamingos are pink because of pigments in their food.","adaptation":"Their upside-down bills filter tiny food from water.","mission":"Find a bird colored by its diet."},
    {"name":"Platypus","emoji":"🦆","habitat":"Wetlands","diet":"Carnivore","group":"Mammal","region":"Australia","fact":"Platypuses are mammals that lay eggs.","adaptation":"Their bills sense electrical signals from prey.","mission":"Find an egg-laying mammal."},
    {"name":"Snow Leopard","emoji":"🐆","habitat":"Mountains","diet":"Carnivore","group":"Mammal","region":"Central Asia","fact":"A snow leopard's tail can be nearly as long as its body.","adaptation":"Its tail balances jumps and wraps around the face for warmth.","mission":"Find a mountain cat with a blanket-like tail."},
    {"name":"Mountain Goat","emoji":"🐐","habitat":"Mountains","diet":"Herbivore","group":"Mammal","region":"North America","fact":"Mountain goats can climb slopes that look almost vertical.","adaptation":"Split hooves spread apart and rough pads grip rock.","mission":"Find an animal with natural climbing shoes."},
    {"name":"Andean Condor","emoji":"🦅","habitat":"Mountains","diet":"Carnivore","group":"Bird","region":"South America","fact":"Andean condors can soar for hours while barely flapping.","adaptation":"Huge wings ride rising columns of warm air.","mission":"Find one of the world's largest flying birds."},
    {"name":"Yak","emoji":"🐂","habitat":"Mountains","diet":"Herbivore","group":"Mammal","region":"Himalayas and Central Asia","fact":"Yaks have large lungs and hearts for life at high altitude.","adaptation":"Dense wool and a thick undercoat block icy wind.","mission":"Find an animal adapted to thin mountain air."},
)


def all_animals(custom_animals: Iterable[dict[str, Any]] = ()) -> list[dict[str, Any]]:
    """Return the built-in library plus normalized custom entries."""
    built_in = [dict(item) for item in ANIMAL_LIBRARY]
    for item in custom_animals:
        custom = dict(item)
        custom.setdefault("diet", "Unknown")
        custom.setdefault("group", "Nico's Discovery")
        custom.setdefault("region", "Nico's World")
        custom.setdefault("adaptation", custom.get("fact", "A special animal created by Nico."))
        custom.setdefault("mission", f"Learn something new about {custom.get('name', 'this animal')}.")
        built_in.append(custom)
    return built_in


def habitats_for(animals: Iterable[dict[str, Any]]) -> tuple[str, ...]:
    present = {str(animal.get("habitat", "")) for animal in animals}
    ordered = [name for name in HABITATS if name in present]
    extras = sorted(present.difference(HABITATS).difference({""}))
    return tuple(ordered + extras)


def filter_animals(
    animals: Iterable[dict[str, Any]],
    *,
    habitat: str = "All",
    group: str = "All",
    query: str = "",
) -> list[dict[str, Any]]:
    needle = query.strip().casefold()
    result: list[dict[str, Any]] = []
    for animal in animals:
        if habitat != "All" and animal.get("habitat") != habitat:
            continue
        if group != "All" and animal.get("group") != group:
            continue
        searchable = " ".join(str(animal.get(key, "")) for key in ("name", "habitat", "group", "region", "fact"))
        if needle and needle not in searchable.casefold():
            continue
        result.append(animal)
    return result


def habitat_progress(discovered: Iterable[str], animals: Iterable[dict[str, Any]]) -> dict[str, tuple[int, int]]:
    found = {name.casefold() for name in discovered}
    progress: dict[str, tuple[int, int]] = {}
    for habitat in habitats_for(animals):
        members = [animal for animal in animals if animal.get("habitat") == habitat]
        complete = sum(str(animal.get("name", "")).casefold() in found for animal in members)
        progress[habitat] = (complete, len(members))
    return progress


def choose_expedition(
    animals: Iterable[dict[str, Any]],
    discovered: Iterable[str],
    *,
    habitat: str = "All",
    seed: int | str | None = None,
) -> dict[str, Any]:
    pool = [animal for animal in animals if habitat == "All" or animal.get("habitat") == habitat]
    if not pool:
        raise ValueError("No animals are available for this expedition")
    found = {name.casefold() for name in discovered}
    unseen = [animal for animal in pool if str(animal.get("name", "")).casefold() not in found]
    return dict(random.Random(seed).choice(unseen or pool))


def make_quiz(animals: Iterable[dict[str, Any]], *, seed: int | str | None = None) -> dict[str, Any]:
    pool = list(animals)
    if len(pool) < 4:
        raise ValueError("At least four animals are required for a quiz")
    rng = random.Random(seed)
    answer = rng.choice(pool)
    quiz_type = rng.choice(("habitat", "adaptation", "fact"))
    if quiz_type == "habitat":
        prompt = f"Which animal lives in the {answer['habitat']} habitat?"
    elif quiz_type == "adaptation":
        prompt = f"Which animal has this adaptation? {answer['adaptation']}"
    else:
        prompt = f"Which animal matches this fact? {answer['fact']}"
    distractors = rng.sample([item for item in pool if item["name"] != answer["name"]], 3)
    options = [answer["name"], *(item["name"] for item in distractors)]
    rng.shuffle(options)
    return {"prompt": prompt, "answer": answer["name"], "options": options, "animal": answer}

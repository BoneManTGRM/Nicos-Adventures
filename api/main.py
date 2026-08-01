"""FastAPI service for Nico's World 3.0.

The API is intentionally stateless in this release. The browser owns the active save and can
submit it for validation and bounded repair. A parent-controlled database can be added later
without changing the public profile contract.
"""

from __future__ import annotations

from copy import deepcopy

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import (
    BootstrapResponse,
    MissionModel,
    ProfileModel,
    RepairReport,
    RobotModel,
    WorldLocation,
)

app = FastAPI(title="Nico's World API", version="3.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

LOCATIONS = [
    WorldLocation(id="robo-city", name="Robo City", emoji="🤖", description="Build, upgrade, and train robot friends.", stars_required=0, route="/robots"),
    WorldLocation(id="animal-forest", name="Animal Forest", emoji="🌳", description="Explore habitats and rescue real animals.", stars_required=0, route="/animals"),
    WorldLocation(id="monster-mountain", name="Monster Mountain", emoji="👾", description="Create friendly monsters and solve mysteries.", stars_required=8, route="/monsters"),
    WorldLocation(id="story-castle", name="Story Castle", emoji="🏰", description="Turn Nico's creations into adventures.", stars_required=12, route="/stories"),
    WorldLocation(id="game-arcade", name="Game Arcade", emoji="🕹️", description="Play skill games that use world collections.", stars_required=16, route="/arcade"),
    WorldLocation(id="space-station", name="Space Station", emoji="🚀", description="Prepare mecha equipment for science missions.", stars_required=28, route="/space"),
]

MISSIONS = [
    MissionModel(id="forest-signal", title="The Forest Signal", description="Trace a mysterious signal with a robot sidekick.", objectives=["Build or choose a robot", "Discover an animal", "Complete an animal challenge"], reward_stars=5, destination="Animal Forest"),
    MissionModel(id="lost-reactor", title="The Lost Reactor Core", description="Recover the energy core hidden beyond Monster Mountain.", objectives=["Create a monster", "Equip a scanner", "Finish a robot job"], reward_stars=8, destination="Monster Mountain"),
    MissionModel(id="first-story", title="A Story Comes Alive", description="Write an adventure starring Nico's own collection.", objectives=["Choose a robot hero", "Choose an animal friend", "Save the finished story"], reward_stars=6, destination="Story Castle"),
]


def starter_robot() -> RobotModel:
    return RobotModel(
        id="starter-boltbot",
        name="BoltBot",
        color="Electric Blue",
        secondary_color="Sunny Yellow",
        head="mecha_vanguard",
        eyes="mecha_visor",
        body="mecha_reactor_frame",
        arms="mecha_photon_blades",
        base="mecha_vernier_legs",
        backpack="mecha_wing_binders",
        power="mecha_star_reactor",
        personality="Brave Guardian",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nicos-world-api", "version": app.version}


@app.get("/api/v1/bootstrap", response_model=BootstrapResponse)
def bootstrap() -> BootstrapResponse:
    return BootstrapResponse(
        api_version=app.version,
        save_schema_version=4,
        locations=LOCATIONS,
        missions=MISSIONS,
        starter_robot=starter_robot(),
    )


@app.post("/api/v1/profile/repair", response_model=RepairReport)
def repair_profile(profile: ProfileModel) -> RepairReport:
    repaired = deepcopy(profile)
    changes: list[str] = []

    if not repaired.robots:
        repaired.robots.append(starter_robot())
        changes.append("Added a safe starter robot because the collection was empty.")
    robot_ids = {robot.id for robot in repaired.robots}
    if repaired.active_robot_id not in robot_ids:
        repaired.active_robot_id = repaired.robots[0].id
        changes.append("Selected a valid active robot.")
    if repaired.schema_version < 4:
        repaired.schema_version = 4
        changes.append("Migrated the save contract to version 4.")

    known_locations = {location.name for location in LOCATIONS}
    cleaned = list(dict.fromkeys(name for name in repaired.unlocked_locations if name in known_locations))
    for required in ("Robo City", "Animal Forest"):
        if required not in cleaned:
            cleaned.append(required)
    if cleaned != repaired.unlocked_locations:
        repaired.unlocked_locations = cleaned
        changes.append("Repaired unlocked world locations.")

    repaired.completed_missions = list(dict.fromkeys(repaired.completed_missions))
    repaired.discovered_animals = list(dict.fromkeys(repaired.discovered_animals))
    return RepairReport(repaired=bool(changes), changes=changes, profile=repaired)

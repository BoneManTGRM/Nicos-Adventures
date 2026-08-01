"""Versioned public contracts shared by the web client and Python services."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class RobotModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = "robot-preview"
    name: str = "BoltBot"
    color: str = "Electric Blue"
    secondary_color: str = "Sunny Yellow"
    head: str = "box"
    eyes: str = "round"
    body: str = "classic_core"
    arms: str = "grabber"
    base: str = "bronze_wheels"
    backpack: str = "none"
    power: str = "bubble"
    personality: str = "Curious Explorer"
    level: int = Field(default=1, ge=1, le=100)
    xp: int = Field(default=0, ge=0)


class ProfileModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    schema_version: int = Field(default=4, ge=1)
    child_display_name: str = Field(default="Nico", max_length=40)
    stars: int = Field(default=0, ge=0)
    xp: int = Field(default=0, ge=0)
    language: Literal["English", "Spanish", "Bilingual"] = "English"
    robots: list[RobotModel] = Field(default_factory=list)
    active_robot_id: str | None = None
    discovered_animals: list[str] = Field(default_factory=list)
    monsters: list[dict[str, Any]] = Field(default_factory=list)
    stories: list[dict[str, Any]] = Field(default_factory=list)
    completed_missions: list[str] = Field(default_factory=list)
    unlocked_locations: list[str] = Field(default_factory=lambda: ["Robo City", "Animal Forest"])


class WorldLocation(BaseModel):
    id: str
    name: str
    emoji: str
    description: str
    stars_required: int = Field(ge=0)
    route: str


class MissionModel(BaseModel):
    id: str
    title: str
    description: str
    objectives: list[str]
    reward_stars: int = Field(ge=0)
    destination: str


class BootstrapResponse(BaseModel):
    api_version: str
    save_schema_version: int
    locations: list[WorldLocation]
    missions: list[MissionModel]
    starter_robot: RobotModel


class RepairReport(BaseModel):
    repaired: bool
    changes: list[str]
    profile: ProfileModel

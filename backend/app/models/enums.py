import enum

from sqlalchemy import Enum


class Abundance(enum.StrEnum):
    single = "single"  # 1 plant
    few = "few"  # 2–10
    patch = "patch"  # 11–100
    dense = "dense"  # 100+


class GrowthStage(enum.StrEnum):
    seedling = "seedling"
    young = "young"
    mature = "mature"
    dying = "dying"
    treated = "treated"


class Phenology(enum.StrEnum):
    none = "none"
    flower = "flower"
    fruit = "fruit"
    both = "both"


def pg_enum(cls: type[enum.Enum], name: str) -> Enum:
    # Store the enum's values (not its member names) in a named Postgres enum type.
    return Enum(cls, name=name, values_callable=lambda e: [m.value for m in e])

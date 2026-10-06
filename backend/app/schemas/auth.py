from pydantic import BaseModel, ConfigDict, Field


class LoginIn(BaseModel):
    username: str = Field(max_length=50)
    password: str = Field(max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str

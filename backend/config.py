from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    instagram_username: str = "masuolife"
    instagram_password: str
    x_username: str = "totonoerehome"
    x_password: str
    x_email: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

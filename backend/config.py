from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    apify_api_token: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

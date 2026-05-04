from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    apify_api_token: str = ""
    secret_key: str = "change-me-in-production-use-random-string"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    stripe_secret_key: str = ""
    stripe_standard_price_id: str = ""
    stripe_pro_price_id: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

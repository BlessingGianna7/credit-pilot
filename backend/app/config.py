"""
config.py
---------
Loads settings from the .env file.

Analogy: this is the sticky note on your fridge with the Wi-Fi password
and database address. The rest of the app reads from here.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # These names match keys in backend/.env
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60

    # Look for a file named ".env" next to where we run the app
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()

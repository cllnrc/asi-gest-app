"""
ASI-GEST Configuration
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "ASI-GEST"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database ASI_GEST (read-write)
    DB_ASI_GEST_SERVER: str
    DB_ASI_GEST_PORT: int = 1433
    DB_ASI_GEST_DATABASE: str = "ASI_GEST"
    DB_ASI_GEST_USER: str
    DB_ASI_GEST_PASSWORD: str

    # Database ASITRON gestionale (read-only)
    DB_ASITRON_SERVER: str
    DB_ASITRON_PORT: int = 1433
    DB_ASITRON_DATABASE: str = "ASITRON"
    DB_ASITRON_USER: str
    DB_ASITRON_PASSWORD: str

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @property
    def asi_gest_connection_string(self) -> str:
        """Connection string for ASI_GEST database (read-write)"""
        return (
            f"mssql+pymssql://{self.DB_ASI_GEST_USER}:{self.DB_ASI_GEST_PASSWORD}"
            f"@{self.DB_ASI_GEST_SERVER}:{self.DB_ASI_GEST_PORT}/{self.DB_ASI_GEST_DATABASE}"
        )

    @property
    def asitron_connection_string(self) -> str:
        """Connection string for ASITRON gestionale (read-only)"""
        return (
            f"mssql+pymssql://{self.DB_ASITRON_USER}:{self.DB_ASITRON_PASSWORD}"
            f"@{self.DB_ASITRON_SERVER}:{self.DB_ASITRON_PORT}/{self.DB_ASITRON_DATABASE}"
        )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

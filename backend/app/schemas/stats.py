# @TASK P2-R3-T1 - Platform Stats schema (PlatformStatsResponse)
# @SPEC docs/planning/02-trd.md#platform-stats-api
"""Pydantic schemas for platform statistics resource."""
from pydantic import BaseModel, ConfigDict


class PlatformStatsResponse(BaseModel):
    """Public platform statistics response.

    Fields:
        total_models: Count of AIModel records with status='active'.
        total_bookings: Count of Order records with status='completed'.
        total_brands: Count of User records with role='brand' and is_active=True.
    """

    total_models: int
    total_bookings: int
    total_brands: int

    model_config = ConfigDict(from_attributes=True)

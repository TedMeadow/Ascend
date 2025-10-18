from datetime import datetime
from zoneinfo import ZoneInfo
from .config import settings


def get_current_time():
    return datetime.now(ZoneInfo(settings.TIMEZONE))
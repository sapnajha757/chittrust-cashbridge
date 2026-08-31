import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Silence overly verbose third-party loggers if necessary
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    
    logger = logging.getLogger("chittrust")
    logger.info(f"Logging initialized with level: {settings.LOG_LEVEL}")
    return logger

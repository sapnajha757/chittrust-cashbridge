import logging
import re
import sys
from app.core.config import settings

class SensitiveDataFilter(logging.Filter):
    """
    Filter to mask Bearer JWT tokens, API keys, passwords, and secrets in log messages.
    """
    SENSITIVE_PATTERNS = [
        (r'(?i)(bearer\s+)[a-zA-Z0-9\._\-]+', r'\1[REDACTED_JWT]'),
        (r'(?i)(eyJ[a-zA-Z0-9\._\-]+)', r'[REDACTED_JWT]'),
        (r'(?i)(gsk_[a-zA-Z0-9]+)', r'[REDACTED_GROQ_KEY]'),
        (r'(?i)(rzp_(live|test)_[a-zA-Z0-9]+)', r'[REDACTED_RAZORPAY_KEY]'),
        (r'(?i)(whsec_[a-zA-Z0-9_]+)', r'[REDACTED_WEBHOOK_SECRET]'),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg = record.msg
            for pattern, replacement in self.SENSITIVE_PATTERNS:
                msg = re.sub(pattern, replacement, msg)
            record.msg = msg
        return True


def setup_logging():
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.addFilter(SensitiveDataFilter())

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        handlers=[stream_handler],
        force=True,
    )

    # Silence overly verbose third-party loggers if necessary
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

    logger = logging.getLogger("chittrust")
    logger.info(f"Logging initialized with level: {settings.LOG_LEVEL}")
    return logger


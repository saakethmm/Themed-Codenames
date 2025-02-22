class Config:
    DEBUG = True
    TESTING = False
    SECRET_KEY = 'your-secret-key'
    USE_OLLAMA = False  # Default to False for production

class DevelopmentConfig(Config):
    DEBUG = True
    USE_OLLAMA = True  # Set to True for local development

class ProductionConfig(Config):
    DEBUG = False
    USE_OLLAMA = False  # Ensure it's False for production
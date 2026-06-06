#!/bin/sh

# Function to load a secret into an environment variable
load_secret() {
    local name=$1
    local secret_file="/run/secrets/$name"
    if [ -f "$secret_file" ]; then
        export "$name"=$(cat "$secret_file")
        # Keep silent if loaded to avoid log noise, or use a debug flag
    fi
}

# Load required secrets (if they exist from Docker Secrets)
load_secret "MONGODB_URI"
load_secret "MONGODB_DB"
load_secret "JWT_SECRET"
load_secret "APP_DOMAIN"

# Execute the CMD
exec "$@"

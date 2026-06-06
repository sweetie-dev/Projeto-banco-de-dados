#!/bin/sh

# Function to load a secret into an environment variable
load_secret() {
    local name=$1
    local secret_file="/run/secrets/$name"
    if [ -f "$secret_file" ]; then
        export "$name"=$(cat "$secret_file")
        echo "Loaded secret: $name"
    else
        echo "Secret not found: $name"
    fi
}

# Load required secrets
load_secret "MONGODB_URI"
load_secret "MONGODB_DB"
load_secret "JWT_SECRET"
load_secret "APP_DOMAIN"

# Execute the CMD
exec "$@"

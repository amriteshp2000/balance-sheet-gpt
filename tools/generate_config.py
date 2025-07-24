import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader
import os

# Step 1: Define users & plaintext passwords
users = {
    "analyst1": {
        "email": "analyst@example.com",
        "name": "Analyst One",
        "password": "analystpass",
        "role": "analyst"
    },
    "ceo_retail": {
        "email": "ceo@relianceretail.com",
        "name": "CEO Retail",
        "password": "ceopass",
        "role": "ceo"
    },
    "group_head": {
        "email": "ambani@reliance.com",
        "name": "Mukesh Ambani",
        "password": "ambani123",
        "role": "group"
    }
}

# Step 2: Hash passwords
plaintext_passwords = [user["password"] for user in users.values()]
hashed_passwords = stauth.Hasher(plaintext_passwords).generate()

# Step 3: Build config dictionary
config = {
    "credentials": {
        "usernames": {}
    },
    "cookie": {
        "name": "balance_app",
        "key": "some_random_secret",  # Replace with a real secret for production
        "expiry_days": 7
    },
    "preauthorized": {
        "emails": ["ambani@reliance.com"]
    }
}

for i, (username, user_data) in enumerate(users.items()):
    config["credentials"]["usernames"][username] = {
        "email": user_data["email"],
        "name": user_data["name"],
        "password": hashed_passwords[i],
        "role": user_data["role"]
    }

# Step 4: Write config.yaml
os.makedirs("auth", exist_ok=True)
with open("auth/config.yaml", "w") as file:
    yaml.dump(config, file)

print("✅ config.yaml successfully generated at: auth/config.yaml")

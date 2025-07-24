import bcrypt
import yaml

users = {
    "analyst1": {
        "email": "analyst1@example.com",
        "name": "Analyst One",
        "password": "analystpass",
        "role": "analyst"
    },
    "ceo_jio": {
        "email": "ceo@jioplatforms.com",
        "name": "CEO Jio",
        "password": "ceojio123",
        "role": "ceo",
        "company": "Jio Platforms"
    },
    "ceo_retail": {
        "email": "ceo@relianceretail.com",
        "name": "CEO Retail",
        "password": "ceoretail123",
        "role": "ceo",
        "company": "Reliance Retail Ventures"
    },
    "inventory_mgr": {
        "email": "inventory@ril.com",
        "name": "Inventory Manager",
        "password": "inventory123",
        "role": "inventory_manager",
        "company": "Reliance Industries"
    },
    "group_head": {
        "email": "ambani@reliance.com",
        "name": "Mukesh Ambani",
        "password": "ambani123",
        "role": "owner"
    }
}

# Manually hash using bcrypt
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

config = {
    "credentials": {"usernames": {}},
    "cookie": {
        "name": "balance_app",
        "key": "some_secure_key_123",
        "expiry_days": 7
    }
}

# Add users to config with hashed passwords
for username, data in users.items():
    entry = {
        "email": data["email"],
        "name": data["name"],
        "password": hash_password(data["password"]),
        "role": data["role"]
    }
    if "company" in data:
        entry["company"] = data["company"]
    config["credentials"]["usernames"][username] = entry

# Save to config.yaml
with open("config.yaml", "w") as f:
    yaml.dump(config, f)

print("✅ config.yaml created with bcrypt-hashed passwords.")

import yaml
import streamlit_authenticator as stauth

def load_config(config_path="config.yaml"):
    with open(config_path) as file:
        config = yaml.safe_load(file)
    return config

def get_authenticator(config):
    authenticator = stauth.Authenticate(
        credentials=config['credentials'],
        cookie_name=config['cookie']['name'],
        key=config['cookie']['key'],
        cookie_expiry_days=config['cookie']['expiry_days'],
        preauthorized=config.get('preauthorized', {})
    )
    return authenticator

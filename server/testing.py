import requests

ROOT = "http://51.158.96.254:8080"

action_id = "62bb4dd15d4c5d37e412ef23"
class_id = "62c9c2804a9d87a68075edbc"

def signup():
    return requests.post(f"{ROOT}/auth/signup", json={
        "username": "cory",
        "password": "1923baksdja8sdu",
        "name": "Cory"
    })

def create_admin(token):
    return requests.put(f"{ROOT}/api/user/632e44322fa441c1f566b8e8", json={
        "admin": True
    }, headers={
        "Authorization": f"Bearer {token}"
    })

def login():
    resp = requests.post(f"{ROOT}/auth/login", json={
        "username": "admin",
        "password": "m12o3ihasdbasdkj"
    })
    print(resp.text)
    data = resp.json()
    return data["token"]

def post():
    return requests.post(f"{ROOT}/api/channel", json={
        "name": "Private Channel",
        "userId": "62bddf7ed81b942865446b07"
    }, headers={
        "Authorization": f"Bearer {token}"
    })

def update(aid, token):
    return requests.put(f"{ROOT}/api/character/{aid}", json={
        "type": "character"
    }, headers={
        "Authorization": f"Bearer {token}"
    })

def get(aid, token):
    return requests.get(f"{ROOT}/api/class?ids={aid}", headers={
        "Authorization": f"Bearer {token}"
    })

def search(token):
    return requests.get(f"{ROOT}/api/character/search?page=0&limit=10&scopes=user:62bddf7ed31b942865446b07", headers={
        "Authorization": f"Bearer {token}"
    })

def me():
    return requests.get(f"{ROOT}/api/user/me/channels", headers={
        "Authorization": f"Bearer {token}"
    })

def delete(id, token):
    return requests.delete(f"{ROOT}/api/message/{id}", headers={
        "Authorization": f"Bearer {token}"
    })

resp = signup()
#token = login()
#resp = create_admin(token)
print(resp.text)
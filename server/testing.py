import requests

ROOT = "http://localhost:8080"

action_id = "62bb4dd15d4c5d37e412ef23"
class_id = "62c9c2804a9d87a68075edbc"

def signup():
    return requests.post(f"{ROOT}/auth/signup", json={
        "username": "admin",
        "password": "admin",
        "name": "Admin"
    })

def login():
    resp = requests.post(f"{ROOT}/auth/login", json={
        "username": "admin",
        "password": "admin"
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

token = login()
#print(get("62c6144dba20a07ae86e641b", token).text)
#print(get("62c9c2804a9d87a68075edbc", token).text)
print(delete("632a47465ac2cbbe19291e2c", token).text)
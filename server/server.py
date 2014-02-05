from flask import Flask
from flask_sockets import Sockets
import json


class RoomManager():
    def __init__(self):
        self.clients = []

    def broadcast(self, msg, ignore=[]):
        for c in self.clients:
            if c not in ignore:
                try:
                    c.send(msg)
                except Exception as e:
                    print e
                    self.clients.remove(c)

    def addClient(self, client):
        if client not in self.clients:
            self.clients.append(client)

room = RoomManager()

app = Flask(__name__)
app.config["DEBUG"] = True
sockets = Sockets(app)

@sockets.route('/echo')
def echo_socket(ws):
  while True:
    room.addClient(ws)
    message = ws.receive()
    
    print message
    if not message: return

    message = json.loads(message)
    if message["cmd"] == "add":
        room.broadcast(json.dumps(message), ignore=[ws])

@app.route('/')
def hello():
  return 'Hello'



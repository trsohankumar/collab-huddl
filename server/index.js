const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");

const initialEditorValue = {
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            text: "Random Text here",
          },
        ],
      },
    ],
  },
};

const groupData = {};

const users = {};

const socketToRoom = {};

io.on("connection", function (socket) {
  socket.on("new-operations", function (data) {
    groupData[data.groupId] = data.value;
    console.log(groupData[data.groupId]);
    io.emit(`new-remote-operations-${data.groupId}`, data);
  });

  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.emit('user left',socket.id);
  });
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/groups/:id", (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) {
    groupData[id] = initialEditorValue;
  }

  res.send(groupData[id]);
});

http.listen(5000, function () {
  console.log("listening on *:5000");
});

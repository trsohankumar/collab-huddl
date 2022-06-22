const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");
const { Deta } = require('deta');
const bodyParser = require('body-parser');

const deta = Deta('c0k74q07_6LVyqQVyLRP3ML2i85jnHLWA6wQ4v5R3');
const db = deta.Base('testdb');

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

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


app.get("/groups/:id", (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) {
    groupData[id] = initialEditorValue;
  }
  res.send(groupData[id]);
});

app.post('/docs/',async (req, res) => {
   const { id } = req.body;
   console.log(groupData[id])
   const insertedDoc = await db.put(groupData[id],id);
   
   res.status(201).json(insertedDoc);
  
})

app.delete('/docs/:id',async(req,res)=>{
  const id = req.params.id;
  await db.delete(id);
  groupData[id] = initialEditorValue;
  res.json({ message: 'deleted' });
})

app.post('/docs/fetch',async(req,res)=>{
  const id=req.body.id;
  const docId = req.body.docId;
  console.log(id);
  console.log(docId)

  const doc = await db.get(docId);

  
  if (doc) {
    
    res.send(doc)
  
  } else {
    res.status(404).json({ message: 'user not found' });
  }
})


http.listen(5000, function () {
  console.log("listening on *:5000");
});

/**
 * Import Some Module and Global Section
 */
const PORT = 8001;
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const db = require("./db.js");

// db.connect();

/**
 * ==== Create HTTP Server ====
 */
http.listen(PORT, () => {
  console.log(`Server is starting at ${PORT}.....`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});

/**
 * ==== Create Restful API ====
 */

app.get("/storyInfo", (req, res) => {
  db.getAllStoriesInfo()
    .then(result => {
      res.json({ stories: result });
    })
    .catch(err => {
      throw err;
    });
});

/**
 * ==== Create Socket.io Server ====
 */
io.on("connection", client => {
  const clientID = client.id;

  console.log(`A user connect:${clientID}`);

  client.on("question", sid => {
    /**
     * @ author: Sin Lin
     * @ From CCU DM+ lab
     * @ data : Story id
     * @ first step : connect data base and send sid to get question and qid.
     * @ send {qid : qid, question : question } to client
     */
    function emitQuestion(result) {
      let data;
      if (result.length !== 0) {
        let randNumber = Math.floor(Math.random() * result.length);
        // console.log(randNumber);

        data = result[randNumber].q_name + "," + result[randNumber].qid;

        console.log("question: " + data);
      }
      io.to(clientID).emit("question", data);
    }

    console.log(`sid: ${sid}`);

    let open_number = Math.floor(Math.random() * 3);
    // console.log("open number" + open_number);

    if (open_number == 0) {
      db.getOpenQuestion(parseInt(sid))
        .then(result => {
          emitQuestion(result);
        })
        .catch(err => {
          throw err;
        });
    } else {
      db.getQuestion(parseInt(sid))
        .then(result => {
          emitQuestion(result);
        })
        .catch(err => {
          throw err;
        });
    }
  });

  client.on("answer", data => {
    /**
     * @ author: Sin Lin
     * @ From CCU DM+ lab
     * @ Check whether user's answer is correct or not
     * @ data -> {qid: qid, userInput: userInput}
     * @ return yes or no
     */

    let qid;

    if (String(data.qid).includes("A")) {
      qid = data.qid;

      db.getOpenQuestionResponse(qid)
        .then(result => {
          if (result.length !== 0) {
            let response = result[0];

            console.log(response);

            io.to(clientID).emit("response", response);
          }
        })
        .catch(err => {
          throw err;
        });
    } else {
      qid = parseInt(data.qid);
      let userInput = data.userInput;

      console.log(`User id: ${clientID},qid: ${qid}, answer: ${userInput}`);

      let r;

      db.compareAnswer(qid, userInput).then(result => {
        if (result.length !== 0) {
          r = "yes";
        } else {
          r = "no";
        }
        io.to(clientID).emit("result", r);
      });
    }
  });

  client.on("disconnect", () => {
    console.log(`A client disconnected: ${clientID}`);
    console.log("----------------------------------\n");
  });
});

io.on("disconnect", () => {
  console.log("Server Disconnect");
});

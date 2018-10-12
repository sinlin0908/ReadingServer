/**
 * @ author: Sin Lin
 * @ From CCU DM+ lab
 */
/**
 * Import Some Module and Global Section
 */
const PORT = 8001;
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const db = require("./db.js");


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
  /**
   * @ story info
   */
  db.getAllStoriesInfo()
    .then(result => {
      res.json({
        stories: result
      });
    })
    .catch(err => {
      console.log(err);
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

    const getRandNumber = (max_num) => {
      return Math.floor(Math.random() * max_num);
    }

    const emitQuestion = (result) => {
      let data;
      if (result.length !== 0) {

        let randNumber = getRandNumber(result.length);
        data = result[randNumber].q_name + "," + result[randNumber].qid;

        console.log("question:\n" + data);
      }
      io.to(clientID).emit("question", data);
    }

    console.log(`sid: ${sid}`);

    const MAX_Q_NUM = 3;
    let question_kind = getRandNumber(MAX_Q_NUM);

    if (question_kind == 0) {
      db.getOpenQuestion(parseInt(sid))
        .then(result => {
          emitQuestion(result);
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    } else {
      db.getQuestion(parseInt(sid))
        .then(result => {
          emitQuestion(result);
        })
        .catch(err => {
          console.log(err);
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
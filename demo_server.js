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

let question_count = 0;

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
    const getRandNumber = max_num => {
      return Math.floor(Math.random() * max_num);
    };
    const emitQuestion = result => {
      let data;
      if (result.length !== 0) {
        let randNumber = getRandNumber(result.length);
        data = result[randNumber].q_name + "," + result[randNumber].qid;

        console.log("question:" + data);
      }
      io.to(clientID).emit("question", data);
    };

    const getQuestionKind = () => {

      const MAX_QUESTION_COUNT = 3;

      question_count = question_count % MAX_QUESTION_COUNT;

      console.log(question_count);
      let question_kind;
      switch (question_count) {
        case 0: // yes/no question - A
          question_kind = 'A%';
          break;
        case 1: // close     - B
          question_kind = 'B%';
          break;
        case 2: // open data  -C
          question_kind = 'C%';
          break;
      }

      return question_kind;
    }

    console.log(`sid: ${sid}`);

    let question_kind = getQuestionKind();

    db.getQuestion(sid, question_kind)
      .then(result => {
        emitQuestion(result);
      })
      .catch(err => {
        console.log(err);
        throw err;
      });


    question_count += 1;
  });

  client.on("answer", data => {
    /**
     * @ author: Sin Lin
     * @ From CCU DM+ lab
     * @ Check whether user's answer is correct or not
     * @ data -> {qid: qid, userInput: userInput}
     * @ return yes or no
     */
    console.log(`sid ${clientID} data: ${JSON.stringify(data)}`);

    let qid = String(data.qid);

    const isOpenQuestion = (qid) => {
      if (qid.startsWith("C")) {
        return true;
      } else {
        return false;
      }
    };

    const emitOpenResponse = (result) => {
      if (result.length !== 0) {
        let response = result[0];
        console.log(response);

        io.to(clientID).emit("response", response);
      } else {
        console.log("aaaa");
        let response = {
          a_content: "小朋友很棒喔"
        };
        io.to(clientID).emit("response", response);
      }
    };

    const emitAnswer = (result) => {
      let ans;
      if (result.length !== 0) {
        ans = "yes";
      } else {
        ans = "no";
      }
      io.to(clientID).emit("result", ans);
    };

    if (isOpenQuestion(qid)) {
      db.getOpenQuestionResponse(qid)
        .then(result => {
          emitOpenResponse(result);
        })
        .catch(err => {
          console.log(err);
          throw err;
        })
    } else {
      let user_input = data.userInput;

      db.compareAnswer(qid, user_input)
        .then(result => {
          emitAnswer(result);
        })
        .catch(err => {
          console.log(err);
          throw err;
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
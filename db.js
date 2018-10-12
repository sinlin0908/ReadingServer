/**
 * @ author: Sin Lin
 * @ From CCU DM+ lab
 */

const mysql = require("mysql");

const pool = mysql.createPool({
  poolLimit: 10,
  host: "localhost",
  user: "root",
  password: "password",
  database: "More"
});

module.exports.getQuestion = sid => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT q_name,qid FROM Question WHERE sid = ?;`;
    pool.query(sql, sid, (err, result, field) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports.compareAnswer = (qid, userInput) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT aid FROM answer WHERE qid = '${qid}' and a_content = ?;`;
    pool.query(sql, userInput, (err, result, field) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports.getAllStoriesInfo = () => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM Story;`;
    pool.query(sql, (err, result, field) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports.getOpenQuestion = sid => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT q_name,qid FROM Question WHERE sid = ? and qid like 'A%'`;
    pool.query(sql, sid, (err, result, field) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports.getOpenQuestionResponse = qid => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT a_content FROM answer WHERE qid =?;`;
    pool.query(sql, qid, (err, result, field) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
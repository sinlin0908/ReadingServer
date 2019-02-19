# Reading Server

---

此專案為參加 2018 軟體創作達人暑期成長營作品的 Server

## 架構圖

![架構圖](img/img.png)

## Requirement

- node.js 8.12.0
- Express
- MySql
- socketio

## DataBase Setting

use MySQL, and Database is named More

- Story :

  - Sid
  - Story_name
  - url (https://youtu.be/id)

- Question :

  - qid (open question qid start with A)
  - sid
  - q_name

- answer:
  - aid
  - qid
  - a_content

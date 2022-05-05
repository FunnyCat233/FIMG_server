const express = require('express');
const router = express.Router();

const db = require('../dataBase/db.js')

//获取审核列表
router.post('/getAuditList', (req, res) => {
  let sqlStr = 'select audit.*, user.username FROM audit inner join user using(uid)'
  if(req.body.uid) sqlStr += 'where uid=' + req.body.uid

  db.query(sqlStr, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))  

    res.send({
        status: 0,
        data
    })
  })
});

//添加审核列表
router.post('/addAuditList', (req, res) => {
  let sqlStr = 'insert into audit (uid, imgName, imgSrc, imgFileName, category, introduction, startTime, allowDownload, status) values (?, ?, ?, ?, ?, ?, ?, ?, ?);'

  const item = [req.body.uid, req.body.imgName, req.body.imgSrc, req.body.imgFileName, req.body.category, req.body.introduction, req.body.startTime, req.body.allowDownload, req.body.status]

  db.query(sqlStr, item, (err, results) => {
    if(err) return console.log(err.message);

    res.send({
        status: 0
    })
  })
});

//修改审核列表
router.post('/updateAuditList', (req, res) => {
  let sqlStr = 'update audit set status=?, endTime=?, isRead=? where aid=?'

  db.query(sqlStr, [req.body.status, req.body.endTime, req.body.isRead, req.body.aid], (err, results) => {
    if(err) return console.log(err.message);

    res.send({
        status: 0
    })
  })
});

//用户已读消息
router.post('/readAuditMes', (req, res) => {
  let sqlStr = 'update audit set isRead=1 where aid=?'

  db.query(sqlStr, req.body.aid, (err, results) => {
    if(err) return console.log(err.message);

    res.send({
        status: 0
    })
  })
});

// gpsibbmyvifnbafd

module.exports = router;
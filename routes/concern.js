const express = require('express');
const router = express.Router();

const db = require('../dataBase/db.js')

//获取关注列表
router.post('/getConcernList', (req, res) => {
  let sqlStr = 'select * FROM concern where puid=?'
  if (req.body.muid) sqlStr += ' and muid=' + req.body.muid

  db.query(sqlStr, req.body.puid, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))  

    res.send({
        status: 0,
        data
    })
  })
});

//获取关注图片列表
router.post('/getConcernImgList', (req, res) => {
  let sqlStr = 'select * FROM concern where puid=?'

  let pageSize = req.body.pageSize || 10
  let pageIndex = req.body.pageIndex ? (req.body.pageIndex - 1) * pageSize : 0

  db.query(sqlStr, req.body.puid, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))

    if (data.length) {
      let sql = 'SELECT img.*, user.username FROM img inner join user using(uid) where img.isDel=0 and img.isBan=0 and img.shelve=1 and img.status=0 and (uid=' + data[0].muid  

      for (let i = 1; i < data.length; i++) {
          sql += ' or uid=' + data[i].muid
      }

      sql += ') order by pid desc limit '  + pageIndex + ', ' + pageSize

      db.query(sql, (err, results) => {
        if(err) return console.log(err.message);
    
        const data = JSON.parse(JSON.stringify(results))

        res.send({
            status: 0,
            data
        })
      })
    } else {
      res.send({
        status: 0,
        data: []
      })
    }
  })
});

//获取关注用户列表
router.post('/getConcernUserList', (req, res) => {
  let sqlStr = 'select * FROM concern where puid=?'

  db.query(sqlStr, req.body.puid, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))  

    if (data.length) {
      let sql = 'SELECT * FROM user where status=0 and (uid=' + data[0].muid

      for (let i = 1; i < data.length; i++) {
          sql += ' or uid=' + data[i].muid
      }
      sql += ')'

      console.log(sql);

      db.query(sql, (err, results) => {
        if(err) return console.log(err.message);
    
        const data = JSON.parse(JSON.stringify(results))

        res.send({
            status: 0,
            data
        })
      })
    } else {
      res.send({
        status: 0,
        data: []
      })
    }
  })
});

//添加关注
router.post('/addConcernList', (req, res) => {
  let sqlStr = 'insert into concern(puid, muid) values(?, ?);'

  db.query(sqlStr, [req.body.puid, req.body.muid], (err, results) => {
    if(err) return console.log(err.message);

    res.send({
        status: 0,
        mes: '关注成功'
    })
  })
});

//取消关注
router.post('/delConcernList', (req, res) => {
  let sqlStr = 'delete from concern where puid=? and muid=?'

  db.query(sqlStr, [req.body.puid, req.body.muid], (err, results) => {
    if(err) return console.log(err.message); 

    res.send({
        status: 0,
        mes: '已取消关注'
    })
  })
});

module.exports = router;
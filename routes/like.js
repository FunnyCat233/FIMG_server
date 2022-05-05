const express = require('express');
const router = express.Router();

const db = require('../dataBase/db.js')

//查询点赞列表
router.post('/getLikeList', (req, res) => {
  let sqlStr = 'select * from fimg.like'

  db.query(sqlStr, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))  

    res.send({
        status: 0,
        data
    })
  })
});

//查询单个用户点赞列表
router.post('/getPrivateLikeList', (req, res) => {
    let pageSize = req.body.pageSize || 10
    let pageIndex = req.body.pageIndex ? (req.body.pageIndex - 1) * pageSize : 0
    let sqlStr = 'SELECT img.* FROM img inner join fimg.like on fimg.like.uid=? and img.pid = fimg.like.pid where img.isDel=0 and img.isBan=0 and img.shelve=1 and img.status=0 order by pid desc limit '  + pageIndex + ', ' + pageSize
  
    db.query(sqlStr, req.body.uid, (err, results) => {
      if(err) return console.log(err.message);
  
      const data = JSON.parse(JSON.stringify(results))  
  
      res.send({
          status: 0,
          data
      })
    })
  });

//添加点赞列表
router.post('/addLikeList', (req, res) => {
    let sqlStr = 'insert into fimg.like (uid, pid) values (?, ?);'

    console.log(req.body);

    db.query(sqlStr, [req.body.uid, req.body.pid], (err, results) => {
        if(err) return console.log(err.message);

        const data = JSON.parse(JSON.stringify(results))  

        res.send({
        status: 0,
        data
        })
    })
});

//删除点赞列表
router.post('/delLikeList', (req, res) => {
    let sqlStr = 'delete from fimg.like where lid=?;'

    console.log(req.body);

    db.query(sqlStr, req.body.lid, (err, results) => {
        if(err) return console.log(err.message);

        const data = JSON.parse(JSON.stringify(results))  

        res.send({
        status: 0,
        data
        })
    })
});

module.exports = router;
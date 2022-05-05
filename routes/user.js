const express = require('express');
const router = express.Router();
const fs = require('fs')

const db = require('../dataBase/db.js')

//查询用户列表
router.post('/getUserList', (req, res) => {
  let sqlStr = 'select * from user'
  if (req.body.status == 1) {
    sqlStr += ' where (user.status=0 or user.status=1)'
  } else {
    sqlStr += ' where user.status=0'
  }
  let pageSize = req.body.pageSize || 10
  let pageIndex = req.body.pageIndex ? (req.body.pageIndex - 1) * pageSize : 0

  if (req.body.uid) sqlStr += ' and uid=' + req.body.uid 
  if (req.body.username) sqlStr += ' and username like \'%' + req.body.username + '%\''

  sqlStr += ' order by uid desc limit '  + pageIndex + ', ' + pageSize

  db.query(sqlStr, (err, results) => {
    if(err) return console.log(err.message);

    const sql = 'select count(*) as total from user'
    db.query(sql, (e, r) => {
      if(e) return console.log(e.message);

      const data = JSON.parse(JSON.stringify(results))
      let total = 0
      if (req.body.uid || req.body.username) {
        total = data.length
      } else {
        total = JSON.parse(JSON.stringify(r))[0].total
      }
      
      res.send({
        mes: '获取成功',
        data,
        total
      });
    })
  })
});

//添加用户
router.post('/addUser', (req, res) => {
  let sqlStr = 'insert into user (username, password, email) values (?, ?, ?);'

  db.query(sqlStr, [req.body.username, req.body.password, req.body.email], (err, results) => {
    if(err) return console.log(err.message);

    res.send({
      status: 0
    });
  })
})

//修改用户信息
router.post('/updateUserList', (req, res) => {
  let sqlStr = 'update user set username=?, avatar=?, realname=?, age=?, introduction=? where uid=?'

  if (req.body.avatar) {
    if (req.body.avatar.includes('/public')) {
      req.body.avatar = req.body.avatar.replace('/public', '/imgData/avatar')
    }
  }
  
  db.query(sqlStr, [req.body.username, req.body.avatar, req.body.realname, req.body.age, req.body.introduction, req.body.uid], (err, results) => {
    if(err) return console.log(err.message);

    if(req.body.imgFileName)
      fs.writeFileSync('imgData/avatar/' + req.body.imgFileName, fs.readFileSync('public/' + req.body.imgFileName))
    
    res.send({
      mes: '修改成功',
      status: 0
    });
  })
})

//重置密码
router.post('/resetPassword', (req, res) => {
  let sqlStr = 'update user set password=? where email=?;'

  db.query(sqlStr, [req.body.password, req.body.email], (err, results) => {
    if(err) return console.log(err.message);

    res.send({
      status: 0
    });
  })
})

//封禁用户
router.post('/delUserList', (req, res) => {
  let sqlStr = 'update user set status=1 where uid=?;'

  db.query(sqlStr, req.body.uid, (err, results) => {
    if(err) return console.log(err.message);

    let sql = 'update img set isBan=1 where uid=?;'

    db.query(sql, req.body.uid, (err, results) => {
      if(err) return console.log(err.message);
      
      res.send({
        mes: '封禁成功'
      });
    })
  })
})

//解封用户
router.post('/reopenUserList', (req, res) => {
  let sqlStr = 'update user set status=0 where uid=?;'

  db.query(sqlStr, req.body.uid, (err, results) => {
    if(err) return console.log(err.message);

    let sql = 'update img set isBan=0 where uid=?;'

    db.query(sql, req.body.uid, (err, results) => {
      if(err) return console.log(err.message);
      
      res.send({
        mes: '解封成功'
      });
    })
  })
})

module.exports = router;

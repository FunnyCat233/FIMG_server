const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer')

const db = require('../dataBase/db.js')

//登录
router.post('/Login', (req, res) => {
    let sqlStr = 'SELECT * FROM user where (status=0 or status=1)'
    if (req.body.username) sqlStr += ' and username=' + '\'' + req.body.username + '\''
    if (req.body.password) sqlStr += ' and password=' + req.body.password
    if (req.body.email) sqlStr += ' and email=' + '\'' + req.body.email + '\''
  
    db.query(sqlStr, (err, results) => {
      if(err) return console.log(err.message);
  
      const data = JSON.parse(JSON.stringify(results))
  
      if (data.length === 1 && data[0].status == 0) {
        res.send({
          mes: '登录成功',
          status: 0,
          data
        })
      } else if (data.length === 1 && data[0].status == 1) {
        res.send({
          mes: '该账户已被封禁',
          status: -1
        })
      } else {
        res.send({
          mes: '账号或密码错误',
          status: -2
        })
      }
    })
})

//验证用户
router.post('/verificationUser', (req, res) => {
    let sqlStr = 'SELECT * FROM user where email=' + '\'' + req.body.email + '\';'
  
    db.query(sqlStr, (err, results) => {
      if(err) return console.log(err.message);
  
      const data = JSON.parse(JSON.stringify(results))
  
      if (data.length === 1 && data[0].status == 0) {
        res.send({
          mes: '登录成功',
          status: 0,
          data
        })
      } else if (data.length === 1 && data[0].status == 1) {
        res.send({
          mes: '该账户已被封禁',
          status: -1
        })
      } else {
        res.send({
          mes: '用户未注册',
          status: -2
        })
      }
    })
})

//验证验证码
router.post('/verificationCode', (req, res) => {
    let sqlStr = 'SELECT * FROM verification where email=' + '\'' + req.body.email + '\' and code=?;'
  
    db.query(sqlStr, req.body.code, (err, results) => {
      if(err) return console.log(err.message);
  
      const data = JSON.parse(JSON.stringify(results))
  
      if (data.length === 1) {
        res.send({
          status: 0,
          data
        })
      } else {
        res.send({
          status: -1
        })
      }
    })
})
  
//发送邮箱验证码
router.post('/getCode', (req, res) => {
    let code = Math.floor(Math.random() * 999999)

    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        secureConnection: true,
        port: 465,
        auth: {
            user: '1084912813@qq.com',
            pass: 'gpsibbmyvifnbafd'
        }
    })

    let options = {
        from: '1084912813@qq.com',
        to: `1084912813@qq.com, ${req.body.email}`,
        subject: 'Welcome to the FIMG',
        html: `<p>您的验证码为${code}</p>`
    }

    transporter.sendMail(options, (err, msg) => {
        if (err) {
            console.log(err);
            transporter.close()
        } else {
            res.send({
                status: 0
            })
            transporter.close()
        }
    })

    let sql = 'TRUNCATE TABLE verification;'

    db.query(sql, (err, results) => {
      if(err) return console.log(err.message);
  
      let sqlStr = 'insert into verification values (?, ?);'
  
      db.query(sqlStr, [req.body.email, code], (err, results) => {
        if(err) return console.log(err.message);
    
        res.send({
            status: 0
        })
      })
    })
  });

  
  // gpsibbmyvifnbafd
  
  module.exports = router;
const express = require('express');
const formidable = require('formidable');
const router = express.Router();
const fs = require('fs')

const db = require('../dataBase/db.js')

//查询图片列表
router.post('/getImgList', (req, res) => {
  let sqlStr = 'SELECT img.*, user.username FROM img inner join user using(uid)'
  if (req.body.manager == 1) {
    sqlStr += ' where img.status=0'
  } else {
    sqlStr += ' where img.isDel=0 and img.isBan=0 and img.shelve=1 and img.status=0'
  }
  let pageSize = req.body.pageSize || 10
  let pageIndex = req.body.pageIndex ? (req.body.pageIndex - 1) * pageSize : 0

  if (req.body.pid) sqlStr += ' and pid=' + req.body.pid 
  if (req.body.imgName) sqlStr += ' and imgName like \'%' + req.body.imgName + '%\''
  if (req.body.category) sqlStr += ' and category like \'%' + req.body.category + '%\''
  if (req.body.uid) sqlStr += ' and uid=' + req.body.uid 

  sqlStr += ' order by pid desc limit '  + pageIndex + ', ' + pageSize

  console.log(sqlStr);

  db.query(sqlStr, (err, results) => {
    if(err) return console.log(err.message);

    const sql = 'select count(*) as total from img where status=0'
    
    db.query(sql, (e, r) => {
      if(e) return console.log(e.message);

      const data = JSON.parse(JSON.stringify(results))

      let total = 0
      if (req.body.pid || req.body.imgName || req.body.category) {
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
})

// 添加图片信息
router.post('/addImgList', (req, res) => {
  let sqlStr = 'insert into img (imgName, imgSrc, uid, category, introduction, allowDownload) values (?, ?, ?, ?, ?, ?);'

  if (req.body.imgSrc) {
    if (req.body.imgSrc.includes('/public')) {
      req.body.imgSrc = req.body.imgSrc.replace('/public', '/imgData/image')
    }
  }
  
  db.query(sqlStr, [req.body.imgName, req.body.imgSrc, req.body.uid, req.body.category, req.body.introduction, req.body.allowDownload], (err, results) => {
    if(err) return console.log(err.message);
    console.log(req.body);

    if(req.body.imgSrc)
      fs.writeFileSync('imgData/image/' + req.body.imgFileName, fs.readFileSync('public/' + req.body.imgFileName))
    
    let sql = 'update user set pnumber=pnumber+1 where status=0 and uid=' + req.body.uid

    db.query(sql, (err, results) => {
      if(err) return console.log(err.message);
    })

    res.send({
      mes: '添加成功',
      status: 0
    });
  })
})

// 图片上传
router.post('/uploadImg', (req, res) => {
  // console.log(typeof req);
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return;
    }
    const data = JSON.parse(JSON.stringify(files))
    // console.log(data);
    const path = 'http://localhost:8000/public/'
    data.file.newFilename += ".png"
    fs.writeFileSync("public/" + data.file.newFilename, fs.readFileSync(data.file.filepath))
    res.send({
      status: 0,
      data: path + data.file.newFilename,
      imgFileName: data.file.newFilename
    })
  });
})



//用户删除图片
router.post('/delImgList', (req, res) => {
  let sqlStr = 'update img set isDel=1 where pid=?;'
  
  db.query(sqlStr, req.body.pid, (err, results) => {
    if(err) return console.log(err.message);

    let sql = 'update user set pnumber=pnumber-1 where status=0 and uid=' + req.body.uid
    
    db.query(sql, (err, results) => {
      if(err) return console.log(err.message);
    })

    res.send({
      mes: '删除成功'
    });
  })
})

//管理员清除图片
router.post('/clearImgList', (req, res) => {
  let sqlStr = 'update img set status=1 where pid=?;'
  
  db.query(sqlStr, req.body.pid, (err, results) => {
    if(err) return console.log(err.message);

    res.send({
      mes: '清除成功'
    });
  })
})

//下架图片
router.post('/unShelveImgList', (req, res) => {
  let sqlStr = 'update img set shelve=0 where pid=?;'
  
  db.query(sqlStr, req.body.pid, (err, results) => {
    if(err) return console.log(err.message);

    let sql = 'update user set pnumber=pnumber-1 where status=0 and uid=' + req.body.uid
    
    db.query(sql, (err, results) => {
      if(err) return console.log(err.message);
    })

    res.send({
      mes: '下架成功'
    });
  })
})

//重新上架图片列表
router.post('/shelveImgList', (req, res) => {
  let sqlStr = 'update img set shelve=1 where pid=?;'
  
  db.query(sqlStr, req.body.pid, (err, results) => {
    if(err) return console.log(err.message);

    let sql = 'update user set pnumber=pnumber+1 where status=0 and uid=' + req.body.uid
    
    db.query(sql, (err, results) => {
      if(err) return console.log(err.message);
    })

    res.send({
      mes: '上架成功'
    });
  })
})

//获取点赞前十图片
router.post('/getImgLike', (req, res) => {
  let sqlStr = 'SELECT img.*, user.username FROM img inner join user using(uid) where img.isDel=0 and img.isBan=0 and img.shelve=1 and img.status=0'

  if (req.body.category) sqlStr += ' and img.category=\'' + req.body.category + '\''

  sqlStr += ' order by img.like desc limit 10'

  db.query(sqlStr, req.body.pid, (err, results) => {
    if(err) return console.log(err.message);

    const data = JSON.parse(JSON.stringify(results))

    res.send({
      mes: '获取成功',
      data
    });
  })
})

//修改图片是否允许下载
router.post('/updateImgAllowDownload', (req, res) => {
  let sqlStr = 'update img set allowDownload=? where pid=?'

  db.query(sqlStr, [req.body.allowDownload, req.body.pid], (err, results) => {
    if(err) return console.log(err.message);

    // const data = JSON.parse(JSON.stringify(results))

    res.send({
      mes: '修改成功'
    });
  })
})

module.exports = router;
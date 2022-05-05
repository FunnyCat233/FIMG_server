const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/user');
const imgRouter = require('./routes/img');
const likeRouter = require('./routes/like');
const auditRouter = require('./routes/audit');
const login_registerRouter = require('./routes/login_register');
const concernRouter = require('./routes/concern');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/imgData/avatar', express.static(path.join(__dirname, '/imgData/avatar')))
app.use('/imgData/image', express.static(path.join(__dirname, '/imgData/image')))

app.use('/api/user', userRouter);
app.use('/api/img', imgRouter);
app.use('/api/like', likeRouter);
app.use('/api/audit', auditRouter);
app.use('/api/login_register', login_registerRouter);
app.use('/api/concern', concernRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

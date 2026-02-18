import express from 'express';
import path from 'path';
import morgan from 'morgan';
import createError from 'http-errors';

import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

import './migrate.js';

const app = express();

const viewsPath = path.resolve('views');
const publicPath = path.resolve('public');

app.set('views', viewsPath);
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicPath));

app.use(router);

app.use((req, res, next) => {
  next(createError(404));
});

app.use(errorHandler);

app.use((err, req, res, next) => {
  const isDev = req.app.get('env') === 'development';

  res.locals.message = err.message;
  res.locals.error = isDev ? err : {};

  res.status(err.status ?? 500);
  res.json(err);
});

export default app;

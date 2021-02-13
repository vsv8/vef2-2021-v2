import express from 'express';
import dotenv from 'dotenv';
import { router } from './src/sign.js';

dotenv.config();

const app = express();

const viewsPath = new URL('./views', import.meta.url).pathname;
// const publicPath = new URL('./public', import.meta.url).pathname;

app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

app.locals.isInvalid = isInvalid;

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { title: '404', error: '404 fannst ekki' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line
  console.error(error);
  res.status(500).render('error', { title: 'Villa', error, message: 'nei' });
}

app.use('/', router);
app.use(notFoundHandler);
app.use(errorHandler);

const {
  PORT: port = 3000,
} = process.env;

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

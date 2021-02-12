import express from 'express';
import { insert, select } from './db.js';
import { body, validationResult } from 'express-validator';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const validate = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má ekki vera lengra en 128 stafir'),

  body('nationalId')
    .matches(/^[0-9]{6}-?[0-9]{4}$/)
    .withMessage('Kennitala verður að vera á forminu 0000000000 eða 000000-0000'),

  body('comment')
    .isLength({ max: 512 })
    .withMessage('Athugasemd má ekki vera meira en 512 stafir'),
]

const sanitize = [
  body('name').trim().escape(),
  body('email').normalizeEmail(),
  body('nationalId').blacklist('-'),
]

async function showErrors(req, res, next) {
  const signatures = await select();
  const {
    body: {
      name = '',
      nationalId = '',
      comment = '',
      anonymous = '',
    } = {},
  } = req;

  const data = {
    signatures,
    name,
    nationalId,
    comment,
    anonymous,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    data.title = 'Undirskrift – vandræði';

    return res.render('sign', data);
  }

  return next();
}

async function sign(req, res) {
  const signatures = await select();
  const data = {
    title: 'Undirskrift',
    signatures,
    name: '',
    nationalId: '',
    comment: '',
    anonymous: '',
    errors: []
  };

  res.render('sign', data );
}

async function saveSignature(req, res) {
  const {
    name,
    nationalId,
    comment,
    anonymous
  } = req.body;

  console.log("anonymous: " + anonymous)

  if (anonymous === undefined) {
    await insert({name, nationalId, comment, anonymous: false});
  } else {
    await insert({name, nationalId, comment, anonymous});
  }

  return res.redirect('/');
}

router.get('/', catchErrors(sign));

router.post(
  '/',
  validate,
  showErrors,
  sanitize,
  catchErrors(saveSignature)
);

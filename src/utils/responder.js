
const express = require('express');

const app = express();

const responder = (devRes, prodRes) => {
  if (app.get('env') === 'development') {
    devRes.res.status(devRes.status).json(devRes.error);
  } else if (app.get('env') === 'production') {
    if (prodRes === undefined) {
      devRes.res.status(500).json({ message: 'Something went wrong!' });
    } else {
      const { res } = prodRes;
      const status = prodRes.status === undefined ? 500 : prodRes.status;
      const error = prodRes.error === undefined ? { message: 'Something went wrong!' } : prodRes.error;
      res.status(status).json(error);
    }
  }
};

module.exports = responder;

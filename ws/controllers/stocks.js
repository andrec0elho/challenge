'use strict';

var url = require('url');
var stock = require('../business/stocks');

const response_map = {
  OK: 200,
  EMPTY: 204,
  ERROR: 400,
  ACCESS_DENIED: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

function send_error(res, status, data) {
  const status_code = response_map[status];

  if (status_code === undefined) {
    res.statusCode = 500;
    res.end();
    throw { message: 'No response code found', status: status };
  }

  res.statusCode = status_code;
  if (data !== undefined) {
    delete data.code;
    res.write(JSON.stringify(data));
  }
  res.end();
}

function send_data(res, data) {
  if (data === undefined || (typeof data === typeof [] && data.length === 0)) {
    res.statusCode = 204;
    res.end();
  } else {
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  }
}

function swagger_params(swagger_params) {
  return Object.keys(swagger_params || {}).filter(key => swagger_params[key].value !== undefined).reduce((obj, key) => {
    obj[key] = swagger_params[key].value;
    return obj;
  }, {});
}

module.exports.getCurrency = function getCurrency(req, res, next) {

  const tokenWTD = req.headers['x-token'];
  const tokenFixer = req.headers['x-token-curr'];

  stock.getCurrency(tokenWTD, tokenFixer).then(
    result => {
      return send_data(res, result);
    }
  ).catch(
    error => {
      if (error && error.code != undefined) {
        return send_error(res, error.code, error);
      }
      return send_error(res, 500, error);
    }
  );
};

module.exports.getStockHistory = function getStockHistory(req, res, next) {

  const tokenWTD = req.headers['x-token'];
  const tokenFixer = req.headers['x-token-curr'];

  const params = swagger_params(req.swagger.params);

  stock.getStockHistory(tokenWTD, tokenFixer, params).then(
    result => {
      return send_data(res, result);
    }
  ).catch(
    error => {
      if (error && error.code != undefined) {
        return send_error(res, error.code, error);
      }
      return send_error(res, 500, error);
    }
  );
};

module.exports.getStock = function getStock(req, res, next) {

  const tokenWTD = req.headers['x-token'];
  const tokenFixer = req.headers['x-token-curr'];

  const params = swagger_params(req.swagger.params);

  stock.getStock(tokenWTD, params).then(
    result => {
      return send_data(res, result);
    }
  ).catch(
    error => {
      console.log(error)
      if (error && error.code != undefined) {
        return send_error(res, error.code, error);
      }
      return send_error(res, 500, error);
    }
  );
};


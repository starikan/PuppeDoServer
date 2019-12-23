const _ = require('lodash');

const { socketMethods, createSocketServer } = require('./socketMethods');

if (!module.parent) {
  createSocketServer();
} else {
  module.exports = {
    socketMethods,
    createSocketServer,
  };
}

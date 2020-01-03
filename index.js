const _ = require('lodash');

const { socketMethods, createSocketServer } = require('./socketMethods');

if (!module.parent) {
  require('@puppedo/atoms');
  createSocketServer();
} else {
  module.exports = {
    socketMethods,
    createSocketServer,
  };
}

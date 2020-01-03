const _ = require('lodash');

const { createSocketServer } = require('./socketMethods');

if (!module.parent) {
  require('@puppedo/atoms');
  createSocketServer();
} else {
  module.exports = {
    createSocketServer,
  };
}

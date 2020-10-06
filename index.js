const { createSocketServer } = require('./socketServer');

if (!module.parent) {
  require('@puppedo/atoms');
  createSocketServer();
} else {
  module.exports = {
    createSocketServer,
  };
}

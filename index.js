const _ = require('lodash');

const { socketMethods, createSocketServer } = require('./socketMethods');

const runPPDSocketServer = async () => {
  createSocketServer()
};

if (!module.parent) {
  runPPDSocketServer();
} else {
  module.exports = {
    main,
    socketMethods,
    runPPDSocketServer,
  };
}

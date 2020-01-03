const _ = require('lodash');
const yaml = require('js-yaml');
const WebSocket = require('ws');

const { getUniqueID } = require('./helpers');
const { socketEvents } = require('./socketEvents');

const socketMethods = async ({ data = {}, socket, envsId, method } = {}) => {
  if (socketEvents[method]) {
    await socketEvents[method]({ data, socket, envsIdIn: envsId, method });
  } else {
    throw { message: `Can't find method: ${method} in socket server` };
  }
};

const createSocketServer = ({ host = '127.0.0.1', port = 3001 } = {}) => {
  const wss = new WebSocket.Server({ host, port });

  console.log(wss);
  wss.on('connection', ws => {
    console.log(ws);
    ws.id = getUniqueID();
    ws.sendYAML = function(data) {
      return this.send.call(this, yaml.dump(data, { lineWidth: 1000, indent: 2 }));
    };

    ws.onmessage = async function(event) {
      try {
        const incomeData = JSON.parse(event.data);
        const { envsId, data, method } = incomeData;
        await socketMethods({ envsId, data, method, socket: this });
      } catch (err) {
        console.log(err);
        debugger;
        //TODO: 2019-06-11 S.Starodubov todo
      }
    };
    ws.onclose = e => {
      console.log('Close');
    };
    ws.onerror = () => {
      debugger;
    };
    ws.onopen = () => {};
  });

  console.log(`Server run on port ${port}`);

  return wss;
};

module.exports = {
  socketMethods,
  createSocketServer,
};

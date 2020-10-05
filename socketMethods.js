const yaml = require('js-yaml');
const WebSocket = require('ws');

const { getUniqueID } = require('./helpers');
const { socketEvents } = require('./socketEvents');

const createSocketServer = ({ host = '127.0.0.1', port = 3001 } = {}) => {
  const wss = new WebSocket.Server({ host, port });

  // console.log(wss);
  wss.on('connection', (ws) => {
    console.log(ws);
    ws.id = getUniqueID();
    ws.sendYAML = function (data) {
      return this.send.call(this, yaml.safeDump(data, { lineWidth: 1000, indent: 2, skipInvalid: true }));
    };

    ws.onmessage = async function (event) {
      try {
        const incomeData = JSON.parse(event.data);
        const { envsId, data, method } = incomeData;
        if (socketEvents[method]) {
          await socketEvents[method]({ data, socket: this, envsId, method });
        } else {
          const availableMethods = Object.keys(socketEvents);
          this.sendYAML({
            data: {
              message: `Can't find method: "${method}" in socket server. Available methods: ${JSON.stringify(
                availableMethods,
              )}`,
            },
            type: 'error',
            envsId,
          });
        }
      } catch (err) {
        console.log(err);
        debugger;
        //TODO: 2019-06-11 S.Starodubov todo
      }
    };
    ws.onclose = () => {
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
  createSocketServer,
};

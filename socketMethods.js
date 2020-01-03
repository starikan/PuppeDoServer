const _ = require('lodash');
const yaml = require('js-yaml');
const WebSocket = require('ws');

const { getUniqueID } = require('./helpers');
const ppd = require('@puppedo/core');

const socketFabric = ({ callback = () => {}, method } = {}) => {
  if (!method) {
    return callback;
  } else {
    return async ({ data, socket, envsIdIn } = {}) => {
      try {
        await callback({ envId: envsIdIn, socket, data });
      } catch (err) {
        err.message += ` || error in '${method}'`;
        err.socket = socket;
        err.envsId = envsIdIn;
        socket.sendYAML({ data: { message: err.message, stack: err.stack }, type: 'error', envsId: envsIdIn });
        throw err;
      }
    };
  }
};

const socketEvents = {
  argsInit: socketFabric({
    method: 'argsInit',
    callback: async ({ socket, data, envsId }) => {
      const args = new ppd.Arguments(data);
      socket.sendYAML({ data: args, type: 'argsInit', envsId });
    },
  }),
  getAllTestsData: socketFabric({
    method: 'getAllTestsData',
    callback: async ({ socket, data, envsId }) => {
      const testContent = await new ppd.TestsContent().getAllData();
      socket.sendYAML({ data: testContent, type: 'getAllTestsData', envsId });
    },
  }),
  // createEnvs: socketFabric({
  //   method: 'createEnvs',
  //   callback: async ({ socket, args, envsId }) => {
  //     socket.sendYAML({ data: args, type: 'createEnvs', envsId });
  //   },
  // }),
  // runEnv: socketFabric({
  //   method: 'runEnv',
  //   callback: async ({ socket, envs, args, envsId }) => {
  //     await envs.init({ args, envsId });
  //     socket.sendYAML({ data: args, type: 'runEnv', envsId });
  //   },
  // }),
  // fetchConfigs: socketFabric({
  //   method: 'fetchConfigs',
  //   callback: async ({ socket, envs, args, envsId }) => {
  //     socket.sendYAML({ data: args, type: 'fetchConfigs', envsId });
  //   },
  // }),
  // fetchStruct: socketFabric({
  //   method: 'fetchStruct',
  //   callback: async ({ socket, envs, args, envsId }) => {
  //     // await envs.init({ args, envsId });
  //     const fullJSON = getFullDepthJSON({
  //       envs,
  //       filePath: args.testFile,
  //       // testsFolder: args.testsFolder,
  //       textView: true,
  //     });
  //     socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
  //     const fullDescriptions = getDescriptions();
  //     socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });
  //   },
  // }),
  // fetchAvailableTests: async ({ args = {}, socket, envsIdIn = null } = {}) => {
  //   try {
  //     if (!envsIdIn) {
  //       throw { message: 'Not activate env' };
  //     }
  //     args = argParse(args);
  //     let { envsId, envs, log } = require('./env')({ socket, envsId: envsIdIn });
  //     await envs.init({ args, envsId });
  //     const testsFolder = _.get(envs, ['args', 'testsFolder'], '.');
  //     const allYamls = await getAllYamls({ testsFolder, envsId });
  //     socket.sendYAML({ data: allYamls, type: 'allYamls', envsId });
  //   } catch (err) {
  //     err.message += ` || error in 'fetchAvailableTests'`;
  //     err.socket = socket;
  //     err.envId = envId;
  //     throw err;
  //   }
  // },
};

// const fetchStruct = async (args = {}, socket) => {
//   try {
//     args = new Arguments().init(args);
//     socket.sendYAML({ data: args, type: 'init_args' });
//     let { envsId, envs } = require('./env')({ socket });
//     await envs.init();

//     await new TestsContent({
//       rootFolder: args.PPD_ROOT,
//       additionalFolders: args.PPD_ROOT_ADDITIONAL,
//       ignorePaths: args.PPD_ROOT_IGNORE,
//     }).getAllData();
//     const { fullJSON, textDescription } = getFullDepthJSON({
//       testName: args.testFile,
//     });
//     socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
//     socket.sendYAML({ data: textDescription, type: 'fullDescriptions', envsId });
//   } catch (err) {
//     err.message += ` || error in 'fetchStruct'`;
//     err.socket = socket;
//     throw err;
//   }
// };

// const fetchAvailableTests = async (args = {}, socket) => {
//   try {
//     args = new Arguments().init(args);
//     socket.sendYAML({ data: args, type: 'init_args' });
//     let { envsId, envs } = require('./env')({ socket });
//     await envs.init();
//     const allYamls = await new TestsContent({
//       rootFolder: args.PPD_ROOT,
//       additionalFolders: args.PPD_ROOT_ADDITIONAL,
//       ignorePaths: args.PPD_ROOT_IGNORE,
//     }).getAllData();
//     socket.sendYAML({ data: allYamls, type: 'allYamls', envsId });
//   } catch (err) {
//     err.message += ` || error in 'fetchAvailableTests'`;
//     err.socket = socket;
//     throw err;
//   }
// };

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

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
};

module.exports = { socketEvents };






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
// };

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
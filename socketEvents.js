const ppd = require('@puppedo/core');

const socketFabric = (callback = () => {}) => {
  return async ({ data, socket, envsId, method } = {}) => {
    try {
      await callback({ envsId, socket, data, method });
    } catch (err) {
      err.message += ` || error in '${method}'`;
      err.socket = socket;
      err.envsId = envsId;
      socket.sendYAML({ data: { message: err.message, stack: err.stack }, type: 'error', envsId });
      throw err;
    }
  };
};

const socketEvents = {
  argsInit: socketFabric(async ({ socket, data, envsId, method }) => {
    const args = new ppd.Arguments(data);
    socket.sendYAML({ data: args, type: method, envsId });
  }),
  getAllTestsData: socketFabric(async ({ socket, data, envsId, method }) => {
    const testContent = await new ppd.TestsContent().getAllData();
    socket.sendYAML({ data: testContent, type: method, envsId });
  }),
  createEnvs: socketFabric(async ({ socket, data, envsId, method }) => {
    let envs;
    ({ envsId, envs } = await new ppd.Environment({ envsId }));
    await envs.init();
    socket.sendYAML({ data: { envsId, envs }, type: method, envsId });
  }),
  setCurrentTest: socketFabric(async ({ socket, data, envsId, method }) => {
    let envs;
    ({ envsId, envs } = await new ppd.Environment({ envsId }));
    const { testName } = data;

    envs.set('current.test', testName);
    envs.initOutput();

    socket.sendYAML({ data: { envsId, envs }, type: method, envsId });
  }),
};

module.exports = { socketEvents };

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

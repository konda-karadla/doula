module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Commented out for Jest tests - not needed for testing
      // [
      //   'module:react-native-dotenv',
      //   {
      //     moduleName: '@env',
      //     path: '.env.local',
      //     safe: false,
      //     allowUndefined: true,
      //   },
      // ],
    ],
  };
};


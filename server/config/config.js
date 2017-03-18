let env = process.env.NODE_ENV || 'development';


if (env === 'development' || env === 'test') {
  let config = require('./config.json');
  let configEnv = config[env];

  // Get all the keys from the imported json
  Object.keys(configEnv).forEach(key => {
    process.env[key] = configEnv[key];
  });
}

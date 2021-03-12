process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

const Control = require('./src/Control.js');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  require('dotenv').config();

  const _ = require('lodash');
  const { BU } = require('base-util-jh');
  const config = require('./src/config');
  config.dbInfo = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PW,
    database: process.env.DB_DB,
  };

  const config2 = _.cloneDeep(config);
  config2.locationSeq = 2064;

  const list = [config, config2];
  BU.CLI(list);

  list.forEach(currentItem => {
    const control = new Control(currentItem);
    control.pWeatherCast.requestWeatherCast();
  });

  // control.init();

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    BU.CLI(err);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    BU.CLI(err);
    console.log('Node NOT Exiting...');
  });
}

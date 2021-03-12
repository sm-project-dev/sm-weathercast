const EventEmitter = require('events');
const { BU } = require('base-util-jh');
const PWeatherCast = require('./P_WeatherCast.js');
const Model = require('./Model');

const config = require('./config');

class Control extends EventEmitter {
  /** @param {config} mainConfig */
  constructor(mainConfig = config) {
    super();
    // 개발자모드(File load or 기상청 Rss) 좌표 정보, dao 정보, gcm 설정 정보
    this.config = mainConfig;

    // Procss
    this.pWeatherCast = new PWeatherCast(this);

    // Model
    this.model = new Model(this);
  }

  // 초기 구동 시
  init() {
    // TEST: file 로딩
    return new Promise(resolve => {
      if (this.config.hasDev) {
        this.pWeatherCast.TestRequestWeatherCastForFile();
      } else {
        this.pWeatherCast.requestWeatherCast();
      }
      this.runCronWeatherCast();

      resolve(true);
    });
  }

  // 스케줄러 실행
  runCronWeatherCast() {
    this.pWeatherCast.runCronWeatherCast();
  }

  // 내일 강수확율 가져오기
  getTomorrowPop() {
    return this.model.tomorrowPop;
  }

  /**
   *
   * @param {Error} err
   * @param {weathercastModel} weatherCastData
   */
  async processOnData(err, weatherCastData) {
    if (err) {
      BU.logFile(err);
      this.emit('updateWeatherCast', err.stack);
    } else {
      // 모델에 토스
      try {
        const resultOnData = await this.model.onData(weatherCastData);
        this.emit('updateWeatherCast', null, resultOnData);
      } catch (error) {
        BU.logFile(error);
      }
    }
  }
}

module.exports = Control;

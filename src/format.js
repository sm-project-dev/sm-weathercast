/**
 * @typedef weathercastModel
 * @property {number} x : 위도
 * @property {number} y : 경도
 * @property {Date} announceDate : 적용 시각 '2018-03-14 09:00:00',
 * @property {Array.<weathercast>} weatherCast 기상 정보 리스트
 *
 */

/**
 * @typedef weathercast
 * @property {string} applydate : 적용 시각 '2018-03-14 09:00:00',
 * @property {number} temp : 온도 '12.0',
 * @property {number} pty : (0 : 없음, 1:비, 2:비/눈, 3:눈/비, 4:눈)
 * @property {number} sky : ① 맑음 ② 구름조금 ③ 구름많음 ④ 흐림
 * @property {number} wf : ① Clear ② Partly Cloudy ③ Mostly Cloudy ④ Cloudy ⑤ Rain ⑥ Snow/Rain ⑦ Snow
 * @property {number} pop 강수확율(%)
 * @property {number} r12 (① 0 <= x < 0.1, ② 0.1 <= x < 1, ③ 1 <= x < 5, ④ 5 <= x < 10, ⑤ 10 <= x < 25, ⑥ 25 <= x < 50, ⑦ 50 <= x)
 * @property {number} ws 풍속 : '2.10',
 * @property {number} wd 풍향 0~7 (북, 북동, 동, 남동, 남, 남서, 서, 북서)
 * @property {number} reh 습도(%)
 */

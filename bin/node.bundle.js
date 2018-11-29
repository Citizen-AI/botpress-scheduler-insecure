module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/home/epaminond/private/projects/2015.08.08_keenethics/projects/botpress/botpress/packages/functionals/botpress-scheduler";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _botpress = __webpack_require__(8);

var _util = __webpack_require__(4);

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Validate = __webpack_require__(11);

module.exports = function (bp) {
  return {
    bootstrap: function bootstrap() {
      return bp.db.get().then(initialize);
    },
    create: function create(id, options) {
      return bp.db.get().then(function (knex) {
        return _create(knex, id, options);
      });
    },
    update: function update(id, options) {
      return bp.db.get().then(function (knex) {
        return _update(knex, id, options);
      });
    },
    updateTask: function updateTask(taskId, status, logs, returned) {
      return bp.db.get().then(function (knex) {
        return _updateTask(knex, taskId, status, logs, returned);
      });
    },
    delete: function _delete(id) {
      return bp.db.get().then(function (knex) {
        return remove(knex, id);
      });
    },
    deleteDone: function deleteDone() {
      return bp.db.get().then(function (knex) {
        return _deleteDone(knex);
      });
    },
    listUpcoming: function listUpcoming() {
      return bp.db.get().then(function (knex) {
        return _listUpcoming(knex);
      });
    },
    listPrevious: function listPrevious() {
      return bp.db.get().then(function (knex) {
        return _listPrevious(knex);
      });
    },
    listExpired: function listExpired() {
      return bp.db.get().then(function (knex) {
        return _listExpired(knex);
      });
    },
    scheduleNext: function scheduleNext(id, time) {
      return bp.db.get().then(function (knex) {
        return _scheduleNext(knex, id, time);
      });
    },
    reviveAllExecuting: function reviveAllExecuting() {
      return bp.db.get().then(function (knex) {
        return _reviveAllExecuting(knex);
      });
    }
  };
};

function initialize(knex) {
  return (0, _botpress.DatabaseHelpers)(knex).createTableIfNotExists('scheduler_schedules', function (table) {
    table.string('id').primary();
    table.boolean('enabled');
    table.string('schedule_type');
    table.string('schedule');
    table.string('schedule_human');
    table.timestamp('created_on');
    table.string('action');
  }).then(function () {
    return (0, _botpress.DatabaseHelpers)(knex).createTableIfNotExists('scheduler_tasks', function (table) {
      table.increments('id');
      table.string('scheduleId').references('scheduler_schedules.id').onDelete('CASCADE');
      table.timestamp('scheduledOn');
      table.string('status');
      table.string('logs');
      table.timestamp('finishedOn');
      table.string('returned');
      table.unique(['scheduleId', 'scheduledOn']);
    });
  });
}

function _create(knex, id, options) {
  id = id || String(Math.random() * 100000000000000000000); // TODO: avoid possible duplicates
  options = validateCreateOptions(options);

  options.schedule_human = _util2.default.getHumanExpression(options.schedule_type, options.schedule);

  var firstOccurence = _util2.default.getNextOccurence(options.schedule_type, options.schedule).toDate();

  return knex('scheduler_schedules').insert(_extends({
    id: id,
    created_on: (0, _botpress.DatabaseHelpers)(knex).date.now()
  }, options)).then(function () {
    if (options.enabled) {
      return _scheduleNext(knex, id, firstOccurence);
    }
  }).then(function () {
    return Promise.resolve(id);
  });
}

function _update(knex, id, options) {
  options = validateCreateOptions(options);

  return knex('scheduler_schedules').where({ id: id }).update(_extends({}, options)).then();
}

function _updateTask(knex, taskId, status, logs, returned) {
  var options = { status: status, logs: logs, returned: returned };

  if (_lodash2.default.includes(['done', 'error', 'skipped'], status)) {
    options.finishedOn = (0, _botpress.DatabaseHelpers)(knex).date.now();
  }

  return knex('scheduler_tasks').where({ id: taskId }).update(options).then();
}

function _reviveAllExecuting(knex) {
  return knex('scheduler_tasks').where({ status: 'executing' }).update({ status: 'pending' }).then();
}

function remove(knex, id) {
  return knex('scheduler_schedules').where({ id: id }).del().then(function () {
    return deleteScheduled(knex, id);
  });
}

function _listUpcoming(knex) {
  return knex('scheduler_tasks').where({ status: 'pending' }).join('scheduler_schedules', 'scheduler_tasks.scheduleId', 'scheduler_schedules.id').then();
}

function _listPrevious(knex) {
  var dt = (0, _botpress.DatabaseHelpers)(knex).date;

  return knex('scheduler_tasks').whereRaw(dt.isBefore('scheduledOn', dt.now())).andWhere('status', '!=', 'pending').join('scheduler_schedules', 'scheduler_tasks.scheduleId', 'scheduler_schedules.id').then();
}

function _listExpired(knex) {
  var dt = (0, _botpress.DatabaseHelpers)(knex).date;

  return knex('scheduler_tasks').whereRaw(dt.isBefore('scheduledOn', dt.now())).andWhere('status', '=', 'pending').join('scheduler_schedules', 'scheduler_tasks.scheduleId', 'scheduler_schedules.id').select(['scheduler_tasks.id as taskId', '*']).then();
}

function deleteScheduled(knex, id) {
  return knex('scheduler_tasks').where({ scheduleId: id }).del().then();
}

function _scheduleNext(knex, id, time) {
  // Round the time to the nearest 2 seconds
  var coeff = 1000 * 2;
  var rounded = new Date(Math.round(time.getTime() / coeff) * coeff);

  var ts = (0, _botpress.DatabaseHelpers)(knex).date.format(rounded);

  return knex('scheduler_tasks').insert({
    scheduleId: id,
    scheduledOn: ts,
    status: 'pending'
  }).then();
}

function _deleteDone(knex) {
  return knex('scheduler_tasks').whereNotNull('finishedOn').del().then();
}

function validateCreateOptions(options) {
  var args = Validate.named(options, {
    enabled: 'boolean',
    schedule_type: 'string',
    schedule: 'string',
    action: 'string'
  });

  if (!args.isValid()) {
    throw args.errorString();
  }

  _util2.default.validateExpression(options.schedule_type, options.schedule);

  return _lodash2.default.pick(options, ['enabled', 'schedule_type', 'schedule', 'action']);
}

function validateModifyOptions(options) {
  var args = Validate.named(options, {
    enabled: 'boolean',
    action: 'string'
  });

  if (!args.isValid()) {
    throw args.errorString();
  }

  return _lodash2.default.pick(options, ['enabled', 'action']);
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _moment = __webpack_require__(1);

var _moment2 = _interopRequireDefault(_moment);

var _later = __webpack_require__(9);

var _later2 = _interopRequireDefault(_later);

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cronstrue = __webpack_require__(10);

var getNextOccurence = function getNextOccurence(type, exp) {
  switch (type.toLowerCase()) {
    case 'cron':
      cronstrue.toString(exp); // Validation
      _later2.default.date.localTime();
      var sched1 = _later2.default.parse.cron(exp);
      var next1 = _later2.default.schedule(sched1).next(2, new Date())[0];
      return (0, _moment2.default)(new Date(next1));
    case 'natural':
      _later2.default.date.localTime();
      var sched2 = _later2.default.parse.text(exp);
      var next2 = _later2.default.schedule(sched2).next(2, new Date())[1];
      return (0, _moment2.default)(new Date(next2));
    case 'once':
      return (0, _moment2.default)(new Date(exp));
  }
};

var validateExpression = function validateExpression(type, exp) {
  if (!_lodash2.default.includes(['cron', 'natural', 'once'], type.toLowerCase())) {
    throw new Error('Invalid expression type: ' + type);
  }

  getNextOccurence(type, exp);
};

var getHumanExpression = function getHumanExpression(type, exp) {
  switch (type.toLowerCase()) {
    case 'cron':
      return cronstrue.toString(exp);
    case 'once':
      return 'Once, ' + (0, _moment2.default)(new Date(exp)).fromNow();
    case 'natural':
      return exp;
    default:
      throw new Error('Unknown type: ' + type);
  }
};

module.exports = { getNextOccurence: getNextOccurence, validateExpression: validateExpression, getHumanExpression: getHumanExpression };

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(6);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _botpressVersionManager = __webpack_require__(7);

var _botpressVersionManager2 = _interopRequireDefault(_botpressVersionManager);

var _moment = __webpack_require__(1);

var _moment2 = _interopRequireDefault(_moment);

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = __webpack_require__(2);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _db = __webpack_require__(3);

var _db2 = _interopRequireDefault(_db);

var _daemon = __webpack_require__(12);

var _daemon2 = _interopRequireDefault(_daemon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = {
  config: {},

  init: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(bp) {
      var d;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              (0, _botpressVersionManager2.default)(bp, bp.botpressPath);

              _context.next = 3;
              return (0, _db2.default)(bp).bootstrap();

            case 3:
              d = (0, _daemon2.default)(bp);
              _context.next = 6;
              return d.revive();

            case 6:
              d.start();

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function init(_x) {
      return _ref.apply(this, arguments);
    }

    return init;
  }(),

  ready: function ready(bp) {
    var router = bp.getRouter('botpress-scheduler', { auth: false });

    var catchError = function catchError(res) {
      return function (err) {
        var message = typeof err === 'string' ? err : err.message;
        res.status(500).send({ message: message });
      };
    };

    router.get('/schedules/upcoming', function (req, res) {
      (0, _db2.default)(bp).listUpcoming().then(function (schedules) {
        res.send(_lodash2.default.sortBy(schedules, 'scheduledOn').map(function (s) {
          s.scheduleOn = (0, _moment2.default)(s.scheduledOn).format();
          s.enabled = !!s.enabled;
          return s;
        }));
      }).catch(catchError(res));
    });

    router.get('/schedules/past', function (req, res) {
      (0, _db2.default)(bp).listPrevious().then(function (schedules) {
        res.send(_lodash2.default.sortBy(schedules, function (s) {
          return -s.scheduledOn;
        }).map(function (s) {
          s.scheduleOn = (0, _moment2.default)(s.scheduledOn).format();
          s.enabled = !!s.enabled;
          return s;
        }));
      }).catch(catchError(res));
    });

    router.put('/schedules', function (req, res) {
      (0, _db2.default)(bp).create(req.body.id, req.body).then(function (schedules) {
        res.send(schedules);
        bp.events.emit('scheduler.update');
      }).catch(catchError(res));
    });

    router.post('/schedules', function (req, res) {
      (0, _db2.default)(bp).update(req.body.id, req.body).then(function () {
        res.sendStatus(200);
        bp.events.emit('scheduler.update');
      }).catch(catchError(res));
    });

    router.delete('/schedules', function (req, res) {
      (0, _db2.default)(bp).delete(req.query.id).then(function () {
        res.sendStatus(200);
        bp.events.emit('scheduler.update');
      }).catch(catchError(res));
    });

    router.delete('/done', function (req, res) {
      (0, _db2.default)(bp).deleteDone().then(function () {
        res.sendStatus(200);
        bp.events.emit('scheduler.update');
      }).catch(catchError(res));
    });

    bp.scheduler = {
      /**
       * Adds schedule record and returns promise with id of the record inserted
       * @param  {string} params.schedule dateTime action will be executed
       * @param  {string} params.action string that will be executed
       * @param  {string} [params.id] the unique id of the schedule (if not provided will be generated automatically)
       * @param  {boolean} [params.enabled=true] optional flag specifying whether this task is enabled
       * @param  {string} [scheduleType='once'] type of the scheduler: 'once', 'cron' or 'natural'
       */
      add: function add(_ref2) {
        var id = _ref2.id,
            schedule = _ref2.schedule,
            action = _ref2.action,
            _ref2$enabled = _ref2.enabled,
            enabled = _ref2$enabled === undefined ? true : _ref2$enabled,
            _ref2$scheduleType = _ref2.scheduleType,
            scheduleType = _ref2$scheduleType === undefined ? 'once' : _ref2$scheduleType;
        return (0, _db2.default)(bp).create(id, { schedule: schedule, action: action, enabled: enabled, schedule_type: scheduleType }).then(function () {
          return bp.events.emit('scheduler.update');
        });
      },
      /**
       * Removes schedule record and returns promise with boolean showing whether delete was successful
       * @param  {string} id the id of the schedule to remove
       */
      remove: function remove(id) {
        return (0, _db2.default)(bp).delete(id).then(function () {
          return bp.events.emit('scheduler.update');
        });
      }
    };
  }
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("botpress-version-manager");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("botpress");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("later");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("cronstrue");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("validate-arguments");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _bluebird = __webpack_require__(2);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _db = __webpack_require__(3);

var _db2 = _interopRequireDefault(_db);

var _util = __webpack_require__(4);

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var timerInterval = null;
var lock = false;
var daemon = null;

var createDaemon = function createDaemon(bp) {
  var reschedule = function reschedule(task) {
    if (task.schedule_type.toLowerCase() === 'once') {
      return _bluebird2.default.resolve(null);
    }

    var nextOccurence = _util2.default.getNextOccurence(task.schedule_type, task.schedule).toDate();

    return (0, _db2.default)(bp).scheduleNext(task.id, nextOccurence);
  };

  var runSingleTask = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(expired) {
      var result, AsyncFunction, fn, fromDate, untilDate, returned, logsQuery, logs, flattenLogs;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _db2.default)(bp).updateTask(expired.taskId, 'executing', null, null);

            case 2:
              result = null;

              if (expired.enabled) {
                _context.next = 8;
                break;
              }

              bp.logger.debug('[scheduler] Skipped task ' + expired.taskId + '. Reason=disabled');
              _context.next = 7;
              return (0, _db2.default)(bp).updateTask(expired.taskId, 'skipped', null, null);

            case 7:
              return _context.abrupt('return');

            case 8:
              AsyncFunction = eval('Object.getPrototypeOf(async function() {}).constructor'); // eslint-disable-line no-eval

              fn = new AsyncFunction('bp', 'task', expired.action);


              bp.events.emit('scheduler.update');
              bp.events.emit('scheduler.started', expired);

              fromDate = new Date();
              _context.next = 15;
              return fn(bp, expired);

            case 15:
              result = _context.sent;
              untilDate = new Date();
              returned = result && result.toString && result.toString() || result;
              logsQuery = {
                from: fromDate,
                until: untilDate,
                limit: 1000,
                start: 0,
                order: 'desc',
                fields: ['message']
              };
              _context.next = 21;
              return _bluebird2.default.fromCallback(function (callback) {
                return bp.logger.query(logsQuery, callback);
              });

            case 21:
              logs = _context.sent;
              flattenLogs = (logs && logs.file && logs.file.map(function (x) {
                return x.message;
              }) || []).join('\n');
              _context.next = 25;
              return (0, _db2.default)(bp).updateTask(expired.taskId, 'done', flattenLogs, returned);

            case 25:

              bp.events.emit('scheduler.update');
              bp.events.emit('scheduler.finished', expired);

            case 27:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function runSingleTask(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var _run = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var rescheduled, list;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              rescheduled = {};
              _context3.next = 3;
              return (0, _db2.default)(bp).listExpired();

            case 3:
              list = _context3.sent;
              return _context3.abrupt('return', _bluebird2.default.mapSeries(list, function (expired) {
                return runSingleTask(expired).catch(function (err) {
                  bp.logger.error('[scheduler]', err.message, err.stack);
                  bp.notifications.send({
                    message: 'An error occured while running task: ' + expired.taskId + '. Please check the logs for more info.',
                    level: 'error'
                  });
                  return (0, _db2.default)(bp).updateTask(expired.taskId, 'error', null, null);
                }).finally(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          if (rescheduled[expired.taskId]) {
                            _context2.next = 4;
                            break;
                          }

                          _context2.next = 3;
                          return reschedule(expired);

                        case 3:
                          rescheduled[expired.taskId] = true;

                        case 4:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, undefined);
                })));
              }));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    }));

    return function _run() {
      return _ref2.apply(this, arguments);
    };
  }();

  var run = function run() {
    if (lock === true) {
      return;
    }

    lock = true;
    return _run().finally(function () {
      lock = false;
    });
  };

  var revive = function revive() {
    return (0, _db2.default)(bp).reviveAllExecuting();
  };

  var start = function start() {
    clearInterval(timerInterval);
    timerInterval = setInterval(run, 5000);
  };

  var stop = function stop() {
    return clearInterval(timerInterval);
  };

  return { start: start, stop: stop, revive: revive };
};

module.exports = function (bp) {
  if (!daemon) {
    daemon = createDaemon(bp);
  }

  return daemon;
};

/***/ })
/******/ ]);
//# sourceMappingURL=node.bundle.js.map

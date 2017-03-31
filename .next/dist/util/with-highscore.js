'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var withHighscore = function withHighscore(fn) {
  return function (_Component) {
    (0, _inherits3.default)(_class, _Component);

    (0, _createClass3.default)(_class, null, [{
      key: 'getInitialProps',
      value: function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
          var ref, scores, scoresVal, listOfScores;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  ref = _db2.default.ref('scores');
                  _context.next = 3;
                  return ref.once('value');

                case 3:
                  scores = _context.sent;
                  scoresVal = scores.val();
                  listOfScores = (0, _keys2.default)(scoresVal).map(function (key) {
                    return scoresVal[key];
                  }).sort(function (a, b) {
                    return b.score - a.score;
                  });
                  return _context.abrupt('return', {
                    scores: listOfScores
                  });

                case 7:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function getInitialProps() {
          return _ref.apply(this, arguments);
        }

        return getInitialProps;
      }()
    }]);

    function _class(props) {
      (0, _classCallCheck3.default)(this, _class);

      var _this = (0, _possibleConstructorReturn3.default)(this, (_class.__proto__ || (0, _getPrototypeOf2.default)(_class)).call(this, props));

      _this.state = (0, _assign2.default)({}, props);
      _this.onUpdateScore = _this.onUpdateScore.bind(_this);
      return _this;
    }

    (0, _createClass3.default)(_class, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        _db2.default.ref('scores').on('value', this.onUpdateScore);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        _db2.default.ref('scores').off('value', this.onUpdateScore);
      }
    }, {
      key: 'onUpdateScore',
      value: function onUpdateScore(scorebaru) {
        var scores = scorebaru.val();
        var listOfScores = (0, _keys2.default)(scores).map(function (key) {
          return scores[key];
        }).sort(function (a, b) {
          return b.score - a.score;
        });
        this.setState({ scores: listOfScores });
      }
    }, {
      key: 'render',
      value: function render() {
        return fn(this.state);
      }
    }]);

    return _class;
  }(_react.Component);
};

exports.default = withHighscore;
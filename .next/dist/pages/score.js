'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _withHighscore = require('../util/with-highscore');

var _withHighscore2 = _interopRequireDefault(_withHighscore);

var _db = require('../util/db');

var _db2 = _interopRequireDefault(_db);

var _page = require('../layout/page');

var _page2 = _interopRequireDefault(_page);

var _prefetch = require('next/dist/lib/prefetch.js');

var _prefetch2 = _interopRequireDefault(_prefetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Score = function (_Component) {
  (0, _inherits3.default)(Score, _Component);

  function Score() {
    (0, _classCallCheck3.default)(this, Score);

    return (0, _possibleConstructorReturn3.default)(this, (Score.__proto__ || (0, _getPrototypeOf2.default)(Score)).apply(this, arguments));
  }

  (0, _createClass3.default)(Score, [{
    key: 'render',
    value: function render() {
      var user = this.props.user;

      if (!user) user = {};
      return _react2.default.createElement(_page2.default, {
        title: 'Acakata - skor ' + user.score + ' dari ' + user.displayName + ' di game tebak kata multiplayer',
        description: 'Acakata - skor ' + user.score + ' dari ' + user.displayName + ' di game tebak kata multiplayer',
        image: user.pictureUrl }, _react2.default.createElement('div', { className: 'page' }, _react2.default.createElement('div', { className: 'logo-wrapper' }, _react2.default.createElement('img', { src: '/static/img/acakatasmall.png', alt: '', style: { height: '40px' } })), _react2.default.createElement('h1', null, user.displayName), _react2.default.createElement('div', null, _react2.default.createElement('img', { src: user.pictureUrl, className: 'page-profile', alt: '' })), _react2.default.createElement('div', null, user.displayName + ' menyandang skor sebanyak ' + user.score + '.'), _react2.default.createElement('hr', null), _react2.default.createElement('div', null, 'Yuk cobain game ini! ', ' ', _react2.default.createElement('a', { href: 'https://line.me/R/ti/p/%40qok8105h' }, _react2.default.createElement('img', { height: '36', alt: 'Tambah Teman', src: 'https://scdn.line-apps.com/n/line_add_friends/btn/en.png' }))), _react2.default.createElement('div', null, 'Lihat pemain lain ', _react2.default.createElement(_prefetch2.default, { href: '/' }, _react2.default.createElement('a', { className: 'page-button' }, 'Home')))));
    }
  }], [{
    key: 'getInitialProps',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(props) {
        var id, ref, user, userVal;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                id = props && props.query.id;

                if (id) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return', {});

              case 3:
                ref = _db2.default.ref('scores/' + id);
                _context.next = 6;
                return ref.once('value');

              case 6:
                user = _context.sent;
                userVal = user.val();
                return _context.abrupt('return', {
                  user: userVal
                });

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getInitialProps(_x) {
        return _ref.apply(this, arguments);
      }

      return getInitialProps;
    }()
  }]);

  return Score;
}(_react.Component);

exports.default = Score;

;
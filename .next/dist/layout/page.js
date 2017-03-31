'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _head = require('next/dist/lib/head.js');

var _head2 = _interopRequireDefault(_head);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Page = function (_Component) {
  (0, _inherits3.default)(Page, _Component);

  function Page() {
    (0, _classCallCheck3.default)(this, Page);

    return (0, _possibleConstructorReturn3.default)(this, (Page.__proto__ || (0, _getPrototypeOf2.default)(Page)).apply(this, arguments));
  }

  (0, _createClass3.default)(Page, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          title = _props.title,
          description = _props.description,
          image = _props.image;

      return _react2.default.createElement('html', null, _react2.default.createElement(_head2.default, null, _react2.default.createElement('meta', { charset: 'utf-8' }), _react2.default.createElement('meta', { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }), _react2.default.createElement('title', null, title ? title : 'Acakata - Permainan multiplayer tebak kata lewat chat'), _react2.default.createElement('meta', { name: 'description', content: description ? description : 'Permainan Multiplayer Tebak Kata Lewat Chat' }), _react2.default.createElement('meta', { name: 'keywords', content: 'Acakata, tebak kata, multiplayer, online, line bot, battle, duel' }), _react2.default.createElement('meta', { name: 'author', content: 'Sonny Lazuardi' }), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }), _react2.default.createElement('meta', { name: 'twitter:card', content: 'summary_large_image' }), _react2.default.createElement('meta', { name: 'twitter:domain', content: 'http://acakatagame.com/' }), _react2.default.createElement('meta', { name: 'twitter:image:src', content: '/static/img/shareBanner.jpg' }), _react2.default.createElement('meta', { property: 'og:title', content: title ? title : 'Acakata - Permainan multiplayer tebak kata lewat chat' }), _react2.default.createElement('meta', { property: 'og:description', content: description ? description : 'Permainan Multiplayer Tebak Kata Lewat Chat' }), _react2.default.createElement('meta', { property: 'og:image', content: image ? image : '/static/img/shareBanner.jpg' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/favicon', href: 'img/favicon.ico' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/favicon', href: 'img/favicon.png' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/css/normalize.css' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/css/main.css' }), _react2.default.createElement('link', { rel: 'image_src', href: '/static/img/shareBanner.jpg' }), _react2.default.createElement('script', { src: '/static/js/vendor/modernizr-2.8.3.js' }), _react2.default.createElement('meta', { name: 'dicoding:email', content: 'sonnylazuardi@gmail.com' })), _react2.default.createElement('body', null, this.props.children), _react2.default.createElement('div', { id: 'fb-root' }), _react2.default.createElement('script', { dangerouslySetInnerHTML: { __html: '\n        (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n          })(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');\n\n          ga(\'create\', \'UA-96220787-1\', \'auto\');\n          ga(\'send\', \'pageview\');\n            ' } }), _react2.default.createElement('script', { dangerouslySetInnerHTML: { __html: '(function(d, s, id) {\n          var js, fjs = d.getElementsByTagName(s)[0];\n          if (d.getElementById(id)) return;\n          js = d.createElement(s); js.id = id;\n          js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.8&appId=751609978284930";\n          fjs.parentNode.insertBefore(js, fjs);\n        }(document, \'script\', \'facebook-jssdk\'));' } }));
    }
  }]);

  return Page;
}(_react.Component);

exports.default = Page;
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _db = require('../util/db');

var _db2 = _interopRequireDefault(_db);

var _withHighscore = require('../util/with-highscore');

var _withHighscore2 = _interopRequireDefault(_withHighscore);

var _page = require('../layout/page');

var _page2 = _interopRequireDefault(_page);

var _prefetch = require('next/dist/lib/prefetch.js');

var _prefetch2 = _interopRequireDefault(_prefetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _withHighscore2.default)(function (_ref) {
    var scores = _ref.scores;
    return _react2.default.createElement(_page2.default, null, _react2.default.createElement('h1', { className: 'is-invisible' }, 'Acakata \u2013 Permainan multiplayer tebak kata lewat chat'), _react2.default.createElement('div', { className: 'colored_background js-colored_background' }), _react2.default.createElement('div', { className: 'main_container' }, _react2.default.createElement('div', { className: 'frame' }, _react2.default.createElement('div', { className: 'frame--game_container' }, _react2.default.createElement('div', { className: 'content_container--inner' }, _react2.default.createElement('img', { src: '/static/img/ss.jpg', alt: '', style: { width: '285px', height: '500px' } })))), _react2.default.createElement('div', { className: 'content' }, _react2.default.createElement('a', { href: 'index.php', className: 'content--logo' }, _react2.default.createElement('img', { src: '/static/img/logoacakata.png', alt: '' })), _react2.default.createElement('div', { className: 'content--title' }, _react2.default.createElement('img', { src: '/static/img/acakatatitle.png', alt: 'acakata' })), _react2.default.createElement('p', { className: 'content--claim' }, 'Permainan multiplayer tebak kata lewat chat. ', _react2.default.createElement('strong', { className: 'main_orange' }, 'Gampang & seru, kan?')), _react2.default.createElement('div', { className: 'button-wrapper', style: { height: 54, display: 'block' } }, _react2.default.createElement('a', { href: 'https://line.me/R/ti/p/%40qok8105h', style: { display: 'inline-block', height: 54 } }, _react2.default.createElement('img', { height: '36', alt: 'Tambah Teman', src: 'https://scdn.line-apps.com/n/line_add_friends/btn/en.png' })), _react2.default.createElement('div', { style: { backgroundColor: '#f7decf', padding: '8px', marginLeft: '10px', display: 'inline-block', textAlign: 'center', borderRadius: 5 } }, '500+', _react2.default.createElement('div', { style: { fontSize: 12 } }, 'pertanyaan')), _react2.default.createElement('div', { style: { backgroundColor: '#f7decf', padding: '8px', marginLeft: '10px', display: 'inline-block', textAlign: 'center', borderRadius: 5 } }, scores.length, _react2.default.createElement('div', { style: { fontSize: 12 } }, 'pemain'))), _react2.default.createElement('div', null, _react2.default.createElement('div', { className: 'score', style: { height: 200, width: '100%', maxWidth: '300px', display: 'block', position: 'relative', textAlign: 'left' } }, scores.map(function (_ref2, idx) {
        var displayName = _ref2.displayName,
            score = _ref2.score,
            pictureUrl = _ref2.pictureUrl,
            lineId = _ref2.lineId;
        return _react2.default.createElement('div', { key: idx, className: 'score-item' }, _react2.default.createElement(_prefetch2.default, { href: 'score/' + lineId }, _react2.default.createElement('a', null, _react2.default.createElement('img', { src: pictureUrl, className: 'profile', alt: '' }), ' ', displayName, ' - ', score)));
    }))))), _react2.default.createElement('section', { className: 'about js-about' }, _react2.default.createElement('div', { className: 'about--inner r_clear' }, _react2.default.createElement('a', { href: '#', className: 'about--close js-about--close' }, _react2.default.createElement('span', null)), _react2.default.createElement('h2', { className: 'about--title' }, 'Apa itu Acakata ?'), _react2.default.createElement('p', { className: 'about--text' }, 'Game tebak kata yang seru, gampang, dan menantang karena bertanding multiplayer bersama semua orang yang online', _react2.default.createElement('br', null), 'Mau menantang teman mu berdua, bisa tantang duel teman mu dan dapatkan score yang lebih tinggi.', _react2.default.createElement('br', null)), _react2.default.createElement('h2', { className: 'about--title' }, 'Siapa ?'), _react2.default.createElement('ul', { className: 'about--list' }, _react2.default.createElement('li', null, _react2.default.createElement('a', { href: 'https://twitter.com/sonnylazuardi', target: '_blank' }, 'Sonny Lazuardi'), ' \u2013 Designer & Developer'), _react2.default.createElement('li', null, _react2.default.createElement('a', { href: '' }, 'Philip Moniaga'), ' \u2013 Game Developer'), _react2.default.createElement('li', null, _react2.default.createElement('a', { href: 'https://twitter.com/mathdroid', target: '_blank' }, 'Muhammad Mustadi'), ' \u2013 Web Developer')), _react2.default.createElement('a', { className: 'contact_us_button', href: 'https://face' }, 'Page'), _react2.default.createElement('h2', { className: 'about--title' }, 'Featured on'), _react2.default.createElement('ul', { className: 'featured_on' }, _react2.default.createElement('li', { className: 'featured_on--list' }, _react2.default.createElement('a', { href: 'http://www.producthunt.com/posts/acakata-game', target: '_blank' }, _react2.default.createElement('img', { src: 'img/product-hunt-horizontal-logo-red.png' })))))), _react2.default.createElement('footer', { className: 'main_footer' }, _react2.default.createElement('ul', { className: 'main_footer--list' }, _react2.default.createElement('li', null, _react2.default.createElement('a', { href: '#', className: 'js-about_button' }, 'Tentang')), _react2.default.createElement('li', null, _react2.default.createElement('iframe', { src: 'https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2FAcak-Kata-119950058542000%2F%3Ffref%3Dts&width=200&layout=standard&action=like&size=small&show_faces=true&share=true&height=80&appId=751609978284930', width: '450', height: '80', style: { border: 'none', overflow: 'hidden' }, scrolling: 'no', frameborder: '0', allowTransparency: 'true' })))));
});
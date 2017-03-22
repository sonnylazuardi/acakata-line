"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserSchema = new _mongoose2.default.Schema({
  displayName: {
    type: String,
    default: ""
  },
  score: {
    type: Number,
    default: 0
  },
  lineId: {
    type: String,
    default: ""
  }
});

exports.default = _mongoose2.default.model('User', UserSchema);
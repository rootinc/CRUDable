'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKey = exports.defaultPlaceholderId = exports.CRUDableManagement = exports.CRUDable = undefined;

var _CRUDable = require('./CRUDable');

var _CRUDable2 = _interopRequireDefault(_CRUDable);

var _CRUDableManagement = require('./CRUDableManagement');

var _CRUDableManagement2 = _interopRequireDefault(_CRUDableManagement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.CRUDable = _CRUDable2.default;
exports.CRUDableManagement = _CRUDableManagement2.default;
exports.defaultPlaceholderId = _CRUDable.defaultPlaceholderId;
exports.getKey = _CRUDable.getKey;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultPlaceholderId = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getKey = getKey;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultPlaceholderId = exports.defaultPlaceholderId = 1000000000;

var largeKey = defaultPlaceholderId;

function getKey() {
  return largeKey++;
};

function getObjectAt(object, key) {
  var obj = object;

  var keys = key.split(".");
  for (var i = 0; i < keys.length; i++) {
    obj = obj[keys[i]];
  }

  return obj;
}

function setObjectAt(object, key, val) {
  var obj = object;

  var keys = key.split(".");

  var myKey = keys[0];

  for (var i = 1; i < keys.length; i++) {
    obj = obj[keys[i - 1]];
    myKey = keys[i];
  }

  obj[myKey] = val;
}

var CRUDable = function (_Component) {
  _inherits(CRUDable, _Component);

  function CRUDable(props) {
    _classCallCheck(this, CRUDable);

    var _this = _possibleConstructorReturn(this, (CRUDable.__proto__ || Object.getPrototypeOf(CRUDable)).call(this, props));

    _this.switchToWriteOnly = function () {
      var autoFocusKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _this.setState({
        readOnly: false,
        autoFocusKey: autoFocusKey
      });
    };

    _this.switchToReadOnly = function () {
      _this.setState({
        readOnly: true
      });
    };

    _this.handleClick = function (e) {
      e.stopPropagation();
    };

    _this.handleChange = function (e, key) {
      var updateToServer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      !updateToServer && e.stopPropagation();

      var data = Object.assign({}, _this.props.data);

      var value = e.target.value;
      if (value === 'true' || value === 'yes') {
        value = true;
      } else if (value === 'false' || value === 'no') {
        value = false;
      }
      setObjectAt(data, key, value);

      _this.props.updateObject(data, updateToServer);
    };

    _this.handleFocus = function (e) {
      clearTimeout(_this.inputTimeout);
      _this.inputTimeout = null;
    };

    _this.handleBlur = function (e, key) {
      if (_this.props.data.id < defaultPlaceholderId) {
        //only go to readonly if we have a legit id
        //regardless, if we still stay in writeonly mode, need to send the data up to the server
        _this.handleChange({ target: { value: getObjectAt(_this.props.data, key) } }, key, true);

        _this.inputTimeout = setTimeout(function () {
          _this.switchToReadOnly();
          _this.inputTimeout = null;
        });
      }
    };

    _this.handleCreate = function (e) {
      var data = Object.assign({}, _this.props.data);

      _this.props.createObject(data);

      _this.switchToReadOnly();
    };

    _this.handleCancel = function (e) {
      var data = Object.assign({}, _this.props.data);

      _this.props.cancelObject(data);

      _this.switchToReadOnly();
    };

    _this.handleDelete = function (e) {
      e.stopPropagation();

      var data = Object.assign({}, _this.props.data);

      _this.props.deleteObject(data);
    };

    _this.renderCreateButton = function () {
      var createText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Create Object";
      var cancelText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Cancel";

      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "button",
          {
            onClick: _this.handleCreate
          },
          createText
        ),
        _react2.default.createElement(
          "button",
          {
            onClick: _this.handleCancel
          },
          cancelText
        )
      );
    };

    _this.renderDeleteButton = function () {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Delete Object";

      return _react2.default.createElement(
        "button",
        {
          onFocus: _this.handleFocus,
          onClick: _this.handleDelete
        },
        text
      );
    };

    _this.state = {
      readOnly: props.data.id < defaultPlaceholderId ? true : false,
      autoFocusKey: null
    };
    return _this;
  }

  _createClass(CRUDable, [{
    key: "render",
    value: function render() {
      if (this.state.readOnly) {
        return this.renderReadOnly();
      } else {
        return this.renderWriteOnly();
      }
    }
  }]);

  return CRUDable;
}(_react.Component);

exports.default = CRUDable;
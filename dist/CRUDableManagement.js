'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _CRUDable = require('./CRUDable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CRUDableManagement = function (_Component) {
  _inherits(CRUDableManagement, _Component);

  function CRUDableManagement(props) {
    _classCallCheck(this, CRUDableManagement);

    var _this = _possibleConstructorReturn(this, (CRUDableManagement.__proto__ || Object.getPrototypeOf(CRUDableManagement)).call(this, props));

    _this.findObjectIndex = function (list, item) {
      return list.findIndex(function (i) {
        return item.id === i.id;
      });
    };

    _this.addObjectPlaceholder = function () {
      var key = (0, _CRUDable.getKey)();

      var data = Object.assign({}, _this.props.defaultData);
      data.id = key;

      var type = void 0;

      if (_this.props.addPlaceholderTo == "top") {
        type = "$unshift";
      } else if (_this.props.addPlaceholderTo == "bottom") {
        type = "$push";
      } else {
        type = "$unshift";
      }

      var listWithNewPlaceholderObject = (0, _immutabilityHelper2.default)(_this.props.list, _defineProperty({}, type, [data]));

      _this.setState({
        creating: true
      });

      _this.props.modifyList(null, listWithNewPlaceholderObject, data);
    };

    _this.createObject = function (data) {
      var index = _this.findObjectIndex(_this.props.list, data);

      var listCloned = (0, _immutabilityHelper2.default)(_this.props.list, {});

      var postData = Object.assign({}, _this.props.list[index]); //clone post data object to not conflict with state
      delete postData.id; //remove id here because this will be the made up over 1000000000 num

      _this.setState({ creating: false });

      _this.props.modifyList('POST', listCloned, postData, index);
    };

    _this.updateObject = function (data, updateToServer) {
      var index = _this.findObjectIndex(_this.props.list, data);

      var listWithMergedObject = (0, _immutabilityHelper2.default)(_this.props.list, _defineProperty({}, index, {
        $merge: data
      }));

      //only call a put if we have a legit user id.  Otherwise it is just a user placeholder
      //and if we are supposed to update to the server
      var type = updateToServer && data.id < _CRUDable.defaultPlaceholderId ? 'PUT' : null;

      _this.props.modifyList(type, listWithMergedObject, data, index);
    };

    _this.cancelObject = function (data) {
      var index = _this.findObjectIndex(_this.props.list, data);

      var listWithoutPlaceholderObject = (0, _immutabilityHelper2.default)(_this.props.list, {
        $splice: [[index, 1]]
      });

      _this.setState({
        creating: false
      });

      _this.props.modifyList(null, listWithoutPlaceholderObject, data, index);
    };

    _this.deleteObject = function (data) {
      var index = _this.findObjectIndex(_this.props.list, data);

      var listRemovedObject = (0, _immutabilityHelper2.default)(_this.props.list, {
        $splice: [[index, 1]]
      });

      _this.props.modifyList('DELETE', listRemovedObject, data, index);
    };

    _this.renderAddButton = function () {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Add Object";

      if (!_this.state.creating) {
        return _react2.default.createElement(
          'button',
          {
            onClick: function onClick() {
              _this.addObjectPlaceholder();
            }
          },
          text
        );
      } else {
        return null;
      }
    };

    _this.state = {
      creating: false
    };
    return _this;
  }

  _createClass(CRUDableManagement, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        this.renderAddButton(),
        this.renderContainer()
      );
    }
  }]);

  return CRUDableManagement;
}(_react.Component);

exports.default = CRUDableManagement;
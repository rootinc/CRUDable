import React, { Component } from 'react';

export const defaultPlaceholderId = 1000000000;

let largeKey = defaultPlaceholderId;

export function getKey(){
  return largeKey ++;
};

export default class CRUDable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readOnly: props.data.id < defaultPlaceholderId ? true : false,
      autoFocusKey: null
    };
  }

  switchToWriteOnly = (autoFocusKey=null) => {
    this.setState({
      readOnly: false,
      autoFocusKey: autoFocusKey
    });
  }

  switchToReadOnly = () => {
    this.setState({
      readOnly: true
    });
  }

  handleClick = (e) => {
    e.stopPropagation();
  }

  handleChange = (e, key, updateToServer=false) => {
    !updateToServer && e.stopPropagation();

    let data = Object.assign({}, this.props.data);

    data[key] = e.target.value;

    this.props.updateObject(data, updateToServer);
  }

  handleFocus = (e) => {
    clearTimeout(this.inputTimeout);
    this.inputTimeout = null;
  }

  handleBlur = (e, key) => {
    if (this.props.data.id < defaultPlaceholderId) { //only go to readonly if we have a legit id
      //regardless, if we still stay in writeonly mode, need to send the data up to the server
      this.handleChange({target: {value: this.props.data[key]}}, key, true);

      this.inputTimeout = setTimeout(() => {
        this.switchToReadOnly();
        this.inputTimeout = null;
      });
    }
  }

  handleCreate = (e) => {
    const data = Object.assign({}, this.props.data);

    this.props.createObject(data);

    this.switchToReadOnly();
  }

  handleCancel = (e) => {
    const data = Object.assign({}, this.props.data);

    this.props.cancelObject(data);

    this.switchToReadOnly();
  }

  handleDelete = (e) => {
    e.stopPropagation();

    const data = Object.assign({}, this.props.data);

    this.props.deleteObject(data);
  }

  renderCreateButton = (createText="Create Object", cancelText="Cancel") => {
    return (
      <div>
        <button
          onClick={this.handleCreate}
        >
          {createText}
        </button>
        <button
          onClick={this.handleCancel}
        >
          {cancelText}
        </button>
      </div>
    );
  }

  renderDeleteButton = (text="Delete Object") => {
    return (
      <button
        onFocus={this.handleFocus}
        onClick={this.handleDelete}
      >
        {text}
      </button>
    );
  }

  render() {
    if (this.state.readOnly) {
      return this.renderReadOnly();
    } else {
      return this.renderWriteOnly();
    }
  }

}
import React, { Component } from 'react';

import update from 'immutability-helper';

import {defaultPlaceholderId, getKey} from './CRUDable';

export default class CRUDableManagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creating: false
    };
  }

  findObjectIndex = (list, item) => {
    return list.findIndex((i) => {
      return item.id === i.id;
    })
  }

  addObjectPlaceholder = () => {
    const key = getKey();

    let data = Object.assign({}, this.props.defaultData);
    data.id = key;

    let type;

    if (this.props.addPlaceholderTo == "top")
    {
      type = "$unshift";
    }
    else if (this.props.addPlaceholderTo == "bottom")
    {
      type = "$push";
    }
    else
    {
      type = "$unshift";
    }

    const listWithNewPlaceholderObject = update(this.props.list, {
      [type]: [data]
    });

    this.setState({
      creating: true
    });

    this.props.modifyList(null, listWithNewPlaceholderObject, data);
  }

  createObject = (data) => {
    const index = this.findObjectIndex(this.props.list, data);

    const listCloned = update(this.props.list, {});

    let postData = Object.assign({}, this.props.list[index]); //clone post data object to not conflict with state
    delete postData.id; //remove id here because this will be the made up over 1000000000 num

    this.setState({creating: false});

    this.props.modifyList('POST', listCloned, postData, index);
  }

  updateObject = (data, updateToServer) => {
    const index = this.findObjectIndex(this.props.list, data);

    const listWithMergedObject = update(this.props.list, {
      [index]: {
        $merge: data
      }
    });

    //only call a put if we have a legit user id.  Otherwise it is just a user placeholder
    //and if we are supposed to update to the server
    const type = updateToServer && data.id < defaultPlaceholderId ? 'PUT' : null;

    this.props.modifyList(type, listWithMergedObject, data, index);
  }

  cancelObject = (data) => {
    const index = this.findObjectIndex(this.props.list, data);

    const listWithoutPlaceholderObject = update(this.props.list, {
      $splice: [[index, 1]]
    });

    this.setState({
      creating: false
    });

    this.props.modifyList(null, listWithoutPlaceholderObject, data, index);
  }

  deleteObject = (data) => {
    const index = this.findObjectIndex(this.props.list, data);

    const listRemovedObject = update(this.props.list, {
      $splice: [[index, 1]]
    });

    this.props.modifyList('DELETE', listRemovedObject, data, index);
  }

  renderAddButton = (text="Add Object") => {
    if (!this.state.creating)
    {
      return (
        <button
          onClick={() => {
            this.addObjectPlaceholder()
          }}
        >
          {text}
        </button>
      );
    }
    else
    {
      return null;
    }
  }

  render() {
    return (
      <div>
        {this.renderAddButton()}
        {this.renderContainer()}
      </div>
    );
  }
}

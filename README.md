# CRUDable

Provides CRUDable interfaces with React.

## Installation

1. `yarn github:rootinc/CRUDable`
2. :shipit:

## Usage

### User Example

**User.js**
```
import React, { Component } from 'react';

import {CRUDable, defaultPlaceholderId} from 'CRUDable';

export default class User extends CRUDable {
  renderReadOnly = () => {
    return (
      <tr
        onClick={(e) => {
          const key = e.target.getAttribute('data-key');
          this.switchToWriteOnly(key);
        }}
      >
        <td data-key="email">{this.props.data.email}</td>
        <td data-key="first_name">{this.props.data.first_name}</td>
        <td data-key="last_name">{this.props.data.last_name}</td>
        <td />
      </tr>
    );
  }

  renderWriteOnly = (e) => {
    return (
      <tr>
        <td>
          <input
            autoFocus={this.state.autoFocusKey === "email"}
            value={this.props.data.email}
            onFocus={this.handleFocus}
            onChange={(e) => {this.handleChange(e, 'email'); }}
            onBlur={(e) => {this.handleBlur(e, 'email'); }}
            onClick={this.handleClick}
          />
        </td>
        <td>
          <input
            autoFocus={!this.state.autoFocusKey || this.state.autoFocusKey === "name"}
            value={this.props.data.first_name}
            onFocus={this.handleFocus}
            onChange={(e) => {this.handleChange(e, 'first_name'); }}
            onBlur={(e) => {this.handleBlur(e, 'first_name'); }}
            onClick={this.handleClick}
          />
        </td>
        <td>
          <input
            value={this.props.data.last_name}
            onFocus={this.handleFocus}
            onChange={(e) => {this.handleChange(e, 'last_name'); }}
            onBlur={(e) => {this.handleBlur(e, 'last_name'); }}
            onClick={this.handleClick}
          />
        </td>
        <td>
          {
            this.props.data.id < defaultPlaceholderId ? null : this.renderCreateButton("Create User")
          }

          {
            this.props.data.id < defaultPlaceholderId ? this.renderDeleteButton("Delete User") : null
          }
        </td>
      </tr>
    );
  }
}
```

**UserManagement.js**
```
import React, { Component } from 'react';

import User from './User';

import {CRUDableManagement} from 'CRUDable';

export default class UserManagement extends CRUDableManagement {
  renderList = () => {
    return this.props.list.map((user)=>{
      return (
        <User
          key={user.id}
          data={user}
          createObject={this.createObject}
          cancelObject={this.cancelObject}
          updateObject={this.updateObject}
          deleteObject={this.deleteObject}
        />
      );
    });
  }

  renderContainer = () => {
    return (
      <table className="table table-striped">
        <tbody>
          <tr>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
          </tr>
          {this.renderList()}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div>
        {this.renderAddButton("Add User")}

        {this.renderContainer()}
      </div>
    );
  }
}

```

**UserManagementContainer.js**
```
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import update from 'immutability-helper';

import UserManagement from './UserManagement';

class UserManagementContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: []
    };
  }

  componentWillMount() {
    this.fetchUsers();
  }

  fetchUsers = () => {
    window.axios.get("/api/users")
      .then((response) => {
        this.setState({
          users: response.data.payload.users
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  revertUsers = (index) => {
    return update(this.state.users, {
      $splice: [[index, 1]]
    });
  }

  modifyList = (type, users, user, index) => {
    switch (type)
    {
      case 'POST':
        this.postData(user, index);
        break;
      case 'PUT':
        this.putData(user);
        break;
      case 'DELETE':
        this.deleteData(user);
        break;
    }

    this.setState({users: users});
  }

  postData = (postData, index) => {
    window.axios.post("/api/users", postData)
      .then((response) => {
        if (response.data.status === "error")
        {
          console.error(response);

          this.setState({
            users: this.revertUsers(index)
          });
        }
        else
        {
          const usersWithNewUser = update(this.state.users, {
            [index]: {
              $merge: response.data.payload.user
            }
          });

          this.setState({users: usersWithNewUser});
        }
      })
      .catch((error) => {
        console.error(error);

        this.setState({
          users: this.revertUsers(index)
        });
      });
  }

  putData = (putData) => {
    window.axios.put("/api/users/" + putData.id, putData)
      .then((response) => {
        if (response.data.status === "error")
        {
          console.error(response);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  //data structure we delete, but server we do a put with an empty role, which will "remove" it from the db
  //really what happens is since there is no role for the user, the user won't be queried
  deleteData = (deleteData) => {
    delete deleteData["role"];
    deleteData["user_group_id"] = null;

    window.axios.delete("/api/users/" + deleteData.id, deleteData)
      .then((response) => {
        if (response.data.status === "error")
        {
          console.error(response);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <div>
        <UserManagement
          defaultData={{
            first_name: "Firstname",
            last_name: "Lastname",
            email: "email@domain.com",
          }}
          list={this.state.users}
          modifyList={this.modifyList}
          fetchUsers={this.fetchUsers}
        />
      </div>
    );
  }
}

export default UserManagementContainer;
const usersElement = document.getElementById('users');

if (usersElement) {
  ReactDOM.render(<UserManagementContainer />, usersElement);
}
```

### Another (More Complicated) Example

**Commitment.js**
```
import React, { Component } from 'react';

import {CRUDable, defaultPlaceholderId} from 'CRUDable';

export default class Commitment extends CRUDable {
  renderReadOnly = () => {
    let className = "";

    if (!this.props.data.favorite) {
      className = "-o";
    }

    return (
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
        <div>
          <i
            className={"fa fa-star" + className}
            onClick={() => {
              this.handleChange({target: {value: !this.props.data.favorite}}, 'favorite', true)
            }}
            style={{
              color: "goldenrod",
              fontSize: "1rem"
            }}
          />
        </div>
        <div
          onClick={(e) => {
            if (this.props.canEdit)
            {
              const key = e.target.getAttribute('data-key');
              this.switchToWriteOnly(key);
            }
          }}
          style={{
            flex: "1",
            backgroundColor: this.props.color || this.props.data.compass_module.color,
            color: "white",
            borderRadius: "0.25rem",
            marginLeft: "0.25rem",
            padding: "0.5rem"
          }}
          title="Click to edit"
          data-key="text"
        >
          <span data-key="text">{this.props.data.text}</span>
        </div>
      </div>
    );
  }

  renderWriteOnly = () => {
    return (
      <div>
        <div style={{ display: "flex" }}>
          <textarea
            autoFocus={this.state.autoFocusKey === "text"}
            placeholder="+ Add commitment"
            value={this.props.data.text}
            onFocus={this.handleFocus}
            onChange={(e) => {this.handleChange(e, 'text'); }}
            onBlur={(e) => {this.handleBlur(e, 'text'); }}
            onClick={this.handleClick}
            onKeyDown={(e) => {
              if (e.keyCode === 13)
              {
                e.preventDefault();

                if (this.props.data.text != "")
                {
                  this.handleCreate();
                }
              }
            }}
          />
          {
            this.props.data.id < defaultPlaceholderId ? (
              <div>{this.renderDeleteButton("Delete")}</div>
            ) : null
          }
        </div>

        <p
          style={{
            margin: "4px 0 10px 4px",
            fontSize: ".75rem",
            color: "gray"
          }}
        >
          Hit Enter to Submit
        </p>
      </div>
    );
  }
}
```

**CommitmentManagement.js**
```
import React, { Component } from 'react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Commitment from './Commitment';

import {CRUDableManagement} from 'CRUDable';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default class CommitmentManagement extends CRUDableManagement {
  droppedOutsideOfList = (result) => {
    return !result.destination;
  }

  onDragEnd = (result) => {
    if (this.droppedOutsideOfList(result)) {
      return;
    }

    let list = reorder(this.props.list, result.source.index, result.destination.index);

    for (let i=0; i<list.length; i++)
    {
      list[i].sequence = i;
    }

    this.props.updateFavoriteCommitmentsOrder(list);
  }

  renderCommitment = (commitment, canEdit) => {
    return (
      <Commitment
        key={commitment.id}
        data={commitment}
        color={this.props.color}
        createObject={this.createObject}
        cancelObject={this.cancelObject}
        updateObject={this.updateObject}
        deleteObject={this.deleteObject}
        canEdit={canEdit}
      />
    );
  }

  renderDraggableList = () => {
    return this.props.list.map((commitment, index)=>{
      return (
        <Draggable
          key={commitment.id}
          draggableId={'' + commitment.id}
          index={index}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <i
                  {...provided.dragHandleProps}
                  className="fa fa-ellipsis-h"
                  aria-hidden="true"
                  style={{
                    marginRight: "15px",
                    marginBottom: "0.5rem"
                  }}
                />
                <div style={{flex: 1}}>
                  {this.renderCommitment(commitment, false)}
                </div>
              </div>
            </div>
          )}
        </Draggable>
      );
    });
  }

  renderDnDContainer = () => {
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="1"
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
            >
              {this.renderDraggableList()}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  renderList = () => {
    return this.props.list.map((commitment)=>{
      return this.renderCommitment(commitment, true);
    });
  }

  renderContainer = () => {
    return (
      <div>
        {this.renderList()}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.props.orderable ? this.renderDnDContainer() : this.renderContainer()}
      </div>
    );
  }
}

```

**Commitments.js**
```
import React, { Component } from 'react';

import update from 'immutability-helper';

import CommitmentManagement from './CommitmentManagement';

import {defaultPlaceholderId, getKey} from 'CRUDable';

export default class Commitments extends Component {
  modifyList = (type, commitments, commitment, index) => {
    this.props.modifyCommitments(commitments);

    switch (type)
    {
      case 'POST':
        this.postData(commitment, index);
        break;
      case 'PUT':
        this.putData(commitment);
        break;
      case 'DELETE':
        this.deleteData(commitment);
        break;
    }
  }

  postData = (postData, index) => {
    window.axios.post("/api/commitments", postData)
      .then((response) => {
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

        let commitmentsWithNewCommitmentAndPlaceholder = update(this.props.commitments, {
          [index]: {
            $merge: response.data.payload.commitment,
          },
          [type]: [{ //prepend or append placeholder commitments since there is no add button
            id: getKey(),
            compass_module_id: this.props.compass_module_id,
            text: ""
          }]
        });

        this.props.modifyCommitments(commitmentsWithNewCommitmentAndPlaceholder);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  putData = (putData) => {
    window.axios.put("/api/commitments/" + putData.id, putData)
      .then(() => {
        this.props.refreshFavorites && this.props.refreshFavorites();
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  deleteData = (deleteData) => {
    window.axios.delete("/api/commitments/" + deleteData.id)
      .catch(function (error) {
        console.error(error);
      });
  }

  render() {
    return (
      <div
        className={this.props.className}
      >
        <div style={{backgroundColor: this.props.color}}>
          <strong>{this.props.title}</strong>
          <CommitmentManagement
            list={this.props.commitments}
            modifyList={this.modifyList}
            addPlaceholderTo={this.props.addPlaceholderTo}
            color={this.props.color}
          />
        </div>
      </div>
    );
  }
}
```

**CommitmentsContainer.js**
```
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import update from 'immutability-helper';

import styled from 'styled-components';

import Commitments from './commitments/Commitments';
import CommitmentManagement from './commitments/CommitmentManagement';

import {defaultPlaceholderId, getKey} from 'CRUDable';

class CommitmentsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      compassModulesWithCommitments: [],
      favoriteCommitments: [],
    };
  }

  componentWillMount() {
    this.fetchCompassModulesWithCommitments();
    this.fetchFavoriteCommitments();
  }

  fetchCompassModulesWithCommitments = () => {
    window.axios.get("/api/commitments")
      .then((response) => {
        this.prependPlacholderCommitments(response.data.payload.compass_modules);

        this.setState({
          compassModulesWithCommitments: response.data.payload.compass_modules,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fetchFavoriteCommitments = () => {
    window.axios.get("/api/commitments/favorites")
      .then((response) => {
        this.setState({
          favoriteCommitments: response.data.payload.commitments,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  prependPlacholderCommitments = (compassModules) => {
    for (let i=0; i<compassModules.length; i++)
    {
      let commitments = compassModules[i].commitments;

      commitments.unshift({
        id: getKey(),
        compass_module_id: compassModules[i].id,
        text: ""
      })
    }
  }

  findCompassModuleIndex = (moduleId) => {
    return this.state.compassModulesWithCommitments.findIndex((cm) => {
      return moduleId === cm.id;
    });
  }

  modifyCommitments = (moduleId, commitments) => {
    var index = this.findCompassModuleIndex(moduleId);

    let commitmentsMerged = update(this.state.compassModulesWithCommitments, {
      [index]: {
        commitments: {
          $set: commitments
        }
      }
    });

    this.setState({compassModulesWithCommitments: commitmentsMerged});
  }

  modifyFavoriteCommitments = (type, favoriteCommitments, favoriteCommitment, index) => {
    window.axios.put("/api/commitments/" + favoriteCommitment.id, favoriteCommitment)
      .then(() => {
        this.fetchCompassModulesWithCommitments();
      })
      .catch(function (error) {
        alert(window._genericErrorMessage);
      });

    const listRemovedObject = update(favoriteCommitments, {
      $splice: [[index, 1]]
    });

    this.setState({favoriteCommitments: listRemovedObject});
  }

  updateFavoriteCommitmentsOrder = (list) => {
    window.axios.post("/api/commitments/favorites/reorder", {list: list})
      .catch(function (error) {
        alert(window._genericErrorMessage);
      });

    this.setState({favoriteCommitments: list});
  }

  renderFavoriteCommitments = () => {
    return (
      <div>
        <div>
          <h2>Favorites</h2>
          <CommitmentManagement
            list={this.state.favoriteCommitments}
            modifyList={this.modifyFavoriteCommitments}
            orderable={true}
            updateFavoriteCommitmentsOrder={this.updateFavoriteCommitmentsOrder}
          />
        </div>
      </div>
    );
  }

  renderCommitments = () => {
    return this.state.compassModulesWithCommitments.map((compassModule) => {
      return (
        <Commitments
          key={compassModule.id}
          title={compassModule.title}
          compass_module_id={compassModule.id}
          commitments={compassModule.commitments}
          modifyCommitments={(commitments) => {
            this.modifyCommitments(compassModule.id, commitments);
          }}
          refreshFavorites={this.fetchFavoriteCommitments}
          addPlaceholderTo="top"
          className="className"
          color={compassModule.color}
        />
      );
    });
  }

  render() {
    return (
      <div className="compass-module-detail bx-container">
        <h1 className="card first">Commitments</h1>
        <div className="bx-grid">
          {this.renderFavoriteCommitments()}
          <div style={{ margin: "0" }}>
            {this.renderCommitments()}
          </div>
        </div>
      </div>
    );
  }
}

export default CommitmentsContainer;
const commitmentElement = document.getElementById('commitments');

if (commitmentElement) {
  ReactDOM.render(<CommitmentsContainer />, commitmentElement);
}
```

## Contributing

Thank you for considering contributing to CRUDable! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

CRUDable is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
import React, { Component } from 'react';
import './App.css';
var _ = require('lodash');

class RepoInfoRow extends Component {
  render() {
    return (
      <tr style={{"padding": "10px"}}>
        <td>
          {this.props.name}
        </td>
        <td>
          {this.props.description}
        </td>
        <td>
          {this.props.watchers}
        </td>
      </tr>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repoList: [],
      loading: false,
      user: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  handleInputChange(evt) {
    if (evt.target.value && evt.target.value !== '') {
      this.setState({
        repoList: [], 
        loading: true, 
        user : evt.target.value
      }, _.debounce(this.fetchUserRepos, 500));
    } else {
      this.setState({
        repoList: [], 
        user : ''
      });
    }
  }
  fetchUserRepos() { 
    var url = 'https://api.github.com/users/'+this.state.user+'/repos';
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          this.setState({loading: false, repoList : []});
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then((responseJson) => {
        if (responseJson && responseJson.length > 0) {
          this.sortRepos(responseJson);
        } else {
          this.setState({loading: false});
        }
      })
      .catch((error) => {
        this.setState({loading: false});
        console.log(error);
      });
  }
  sortRepos(repoList) {
    if (repoList && repoList.length > 0) {
      repoList = repoList.sort(function(a, b) {
        var tmp1 = a.watchers; 
        var tmp2 = b.watchers;
        return ((tmp1 > tmp2) ? -1 : ((tmp1 < tmp2) ? 1 : 0));
      });
      this.setState({ loading: false, repoList: repoList });
    }
  }
  render() {
    return (
      <div className="App">
        <div style={{"padding":"15px"}}>
          <span> Github Username: </span>
          <input type="text" value={this.state.user} onChange={this.handleInputChange}  />
        </div>
        <div>
          {(!this.state.user || this.state.user === '') && !this.state.loading &&
            <h3>Please enter a username</h3>
          }
          {this.state.loading &&
            <h3>Fetching repos</h3>
          }
          {this.state.user && !this.state.loading && 
            <div>
            {(!this.state.repoList || !this.state.repoList.length) && 
              <h3>No repos found for user {this.state.user}</h3>
            }
            {(this.state.repoList && this.state.repoList.length > 0) && 
              <div>
                <h3>{this.state.user}'s Public Repos</h3>
                  <table style={{"padding": "10px", "border" : "0px", "margin": "auto", "textAlign": "left"}}>
                    <thead style={{"textAlign": "center"}}>
                      <tr><th>Repo Name</th><th>Description</th><th>Watchers</th></tr>
                    </thead>
                    <tbody>
                        {this.state.repoList.map(function(repo, idx) {
                            return <RepoInfoRow key={"repo-" + idx} name={repo.name} description={repo.description} watchers={repo.watchers} />
                        })}
                    </tbody>
                  </table>
              </div>
            }
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;


import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NewDocumentPage from './NewDocumentPage/NewDocumentPage.js';
import DocumentDirectory from './DocumentDirectory/DocumentDirectory.js';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Router basename="/nguyenvi/marktex">
          <Switch>
            <Route path="/new">
              <NewDocumentPage />
            </Route>
            <Route path="/doc/:documentId">
              <NewDocumentPage />
            </Route>
            <Route path="/">
              <DocumentDirectory />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

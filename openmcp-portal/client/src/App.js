import React, { Component } from "react";
import "./css/style.css";
import SignIn from "./components/common/SignIn";
import Main from './Main';
import { Switch, Route } from "react-router-dom";
// import { fn_refreshAsyncStorage } from "./components/util/Utility";
import { AsyncStorage } from "AsyncStorage";

class App extends Component {

  componentWillMount(){
    // fn_refreshAsyncStorage();
  }

  callApi = async () => {
    const response = await fetch(`/apis/config-codes`);
    const body = await response.json();
    return body;
  };

  componentDidMount() {
    this.callApi()
      .then((res) => {
        if(res !== null){
          res.forEach((item)=>{
            if (item.code === 'DASHBOARD-CYCLE') {
              AsyncStorage.setItem("dashboard-cycle", item.description);
            }
          })
        }
      })
      .catch((err) => console.log(err));
  };


  render() {
    return (
      <Switch>
        <Route exact path="/login" component={SignIn} />
        <Route path="/" component={Main} />
      </Switch>
    );
  }
}

export default App;

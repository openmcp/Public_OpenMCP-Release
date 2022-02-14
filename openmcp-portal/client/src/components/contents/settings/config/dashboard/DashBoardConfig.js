import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import { AsyncStorage } from "AsyncStorage";
import { Button, TextField } from "@material-ui/core";
import Axios from "axios";
import { withTranslation } from 'react-i18next';
import * as utilLog from "../../../../util/UtLogs.js";

class DashBoardConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag : false
    };
  }

  callApi = async () => {
    const response = await fetch(
      `/apis/config-codes`,
    );
    const body = await response.json();
    return body;
  };

  componentWillMount(){
    this.timer = setInterval(this.progress, 20);

    this.callApi()
      .then((res) => {
        if (res === null) { 
          this.setState({ rows: "" });
        } else {
          res.forEach(item => {
            this.setState({
              [item.code] : item.description
            })
          })
          
          this.setState({flag : true});

          let userId = null;
          AsyncStorage.getItem("userName", (err, result) => {
            userId = result;
          });
          utilLog.fn_insertPLogs(userId, "log-CF-VW05");
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  }

  render() {
    const {t} = this.props;
    return (
      <div className="sub-content-wrapper fulled">
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.flag ? (
              <DashBoardConfigSet data={this.state} t={t}/>
            ) : null}
          </Paper>
        </section>
      </div>
    );
  }
}

class DashBoardConfigSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "DASHBOARD-CYCLE": this.props.data["DASHBOARD-CYCLE"],
      "POWER-LOW":this.props.data["POWER-LOW"],
      "POWER-MEDIUM":this.props.data["POWER-MEDIUM"],
      "POWER-HIGH":this.props.data["POWER-HIGH"],
    };
  }

  componentWillMount(){
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onRCycleSave = () => {
    if (parseInt(this.state["DASHBOARD-CYCLE"]) < 5) {
      alert("Please enter greater than 5(seconds)");
      return;
    }

    const url = `/apis/config-codes/dashboard-config/refresh-cycle`;
    const data = {
      config: parseInt(this.state["DASHBOARD-CYCLE"]),
    };

    Axios.put(url, data)
      .then((res) => {
        // alert(res.data.message);
        AsyncStorage.setItem("dashboard-cycle", this.state["DASHBOARD-CYCLE"]);

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX13");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });
  };

  onPURSave=()=>{
    if (this.state["POWER-LOW"].trim().length === 0 || 
    this.state["POWER-MEDIUM"].trim().length === 0 ||
    this.state["POWER-HIGH"].trim().length === 0 )
    {
      alert("Please enter all values");
      return;
    }


    if (parseFloat(this.state["POWER-LOW"]) === 0 || 
    parseFloat(this.state["POWER-MEDIUM"]) === 0 ||
    parseFloat(this.state["POWER-HIGH"]) === 0
    ) {
      alert("Please enter greater than 0(watt)");
      return;
    }

    if(parseFloat(this.state["POWER-LOW"]) >= parseFloat(this.state["POWER-MEDIUM"])){
      alert("'low' value cannot have a larger then 'medium' value");
      return;
    }

    if(parseFloat(this.state["POWER-MEDIUM"]) >= parseFloat(this.state["POWER-HIGH"])){
      alert("'medium' value cannot have a larger then 'high' value");
      return;
    }

    const url = `/apis/config-codes/dashboard-config/power-usage-range`;
    const data = {
      low: parseFloat(this.state["POWER-LOW"]),
      medium: parseFloat(this.state["POWER-MEDIUM"]),
      high: parseFloat(this.state["POWER-HIGH"]),
    };

    Axios.put(url, data)
      .then((res) => {
        alert(res.data.message);

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX14");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });
  }

  render() {
    const t = this.props.t;
    return (
      <div className="dash-config">
        <section>
          <span>{t("config.dashboardConfig.refreshCycle.title")}</span>
          <TextField
            id="outlined-multiline-static"
            rows={1}
            placeholder="refresh cycle"
            variant="outlined"
            value={this.state["DASHBOARD-CYCLE"]}
            fullWidth={false}
            name="DASHBOARD-CYCLE"
            onChange={this.onChange}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.onRCycleSave}
            style={{
              width: "100px",
              height: "31px",
              textTransform: "capitalize",
              float: "right",
              margin: "0px 15px",
              padding: "18px",
            }}
          >
             {t("common.btn.save")}
          </Button>
        </section>
        <section>
          <span>{t("config.dashboardConfig.powerUsageRange.title")}</span>
          <span>low</span>
          <TextField
            id="outlined-multiline-static"
            rows={1}
            placeholder="low"
            variant="outlined"
            value={this.state["POWER-LOW"]}
            fullWidth={false}
            name="POWER-LOW"
            onChange={this.onChange}
          />
          <span>medium</span>
          <TextField
            id="outlined-multiline-static"
            rows={1}
            placeholder="medium"
            variant="outlined"
            value={this.state["POWER-MEDIUM"]}
            fullWidth={false}
            name="POWER-MEDIUM"
            onChange={this.onChange}
          />
          <span>high</span>
          <TextField
            id="outlined-multiline-static"
            rows={1}
            placeholder="high"
            variant="outlined"
            value={this.state["POWER-HIGH"]}
            fullWidth={false}
            name="POWER-HIGH"
            onChange={this.onChange}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.onPURSave}
            style={{
              width: "100px",
              height: "31px",
              textTransform: "capitalize",
              float: "right",
              margin: "0px 15px",
              padding: "18px",
            }}
          >
            {t("common.btn.save")}
          </Button>
        </section>
      </div>
    );
  }
}

export default withTranslation()(DashBoardConfig); 
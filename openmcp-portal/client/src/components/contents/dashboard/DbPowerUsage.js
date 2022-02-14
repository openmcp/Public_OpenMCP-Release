import { CircularProgress } from "@material-ui/core";
import React, { Component } from "react";
// import { PieChart, Pie, Sector, Cell } from "recharts";
import PieReChartPowerRange from "../../modules/PieReChartPowerRange";
import { AsyncStorage } from "AsyncStorage";
import * as utilLog from "../../util/UtLogs.js";
import { withTranslation } from 'react-i18next';

class DbPowerUsage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // range: [
      //   { name: "low", value: 20 },
      //   { name: "medium", value: 50 },
      //   { name: "high", value: 30 },
      // ],
      // rows: [
      //   { name: "usage", value: 70 },
      //   { name: "available", value: 30 },
      // ],
      range : "",
      rows: "",
      settings: {
        width: 300,
        height: 230,
        cx: 145,
        cy: 140,
        outerRadius: 129,
        innerRadius: 80,
        startAngle: 200,
        endAngle: -20,
        minHeight:"305px",
      },
      completed: 0,
      refreshCycle: 5000,
    };
  }

  componentWillMount() {
    let cycle = 5000;
    AsyncStorage.getItem("dashboard-cycle", (err, result) => {
      cycle = result * 1000;
    });

    this.setState({
      refreshCycle: cycle,
    });
  }
  
  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };

    const response = await fetch(
      `/apis/dashboard/power_usage`,
      requestOptions
    );
    const body = await response.json();
    return body;
  };

  componentDidMount(){
    this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-DS-VW02");
  }

  onRefresh = () => {
    const {t} = this.props;
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          if (res.hasOwnProperty("errno")) {
            if (res.code === "ECONNREFUSED") {
              clearInterval(this.timer2);
              this.setState({loadErr : t("dashboard.connectionFailed")})
            }

            this.setState({ rows: "", range: "" });
          } else {
            this.setState({
              rows: res.rows,
              range: res.range
            });
          }
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  
  componentWillUnmount() {
    clearInterval(this.timer2);
  }


  render() {
    const {t} = this.props;
    return (
        <div className="dash-comp">
          {/* 컨텐츠 내용 */}

          <div style={{ display: "flex" }}>
            <div className="content-box">
              <div className="cb-header">
                <span>{t("dashboard.powerUsage.title")}</span>
                {/* <div className="cb-btn">
                      <Link to={this.props.path}>detail</Link>
                    </div> */}
              </div>
              <div
                className="cb-body"
                style={{ position: "relative"}}
              >
                {this.state.rows ? (
                  <PieReChartPowerRange range={this.state.range} data={this.state.rows} settings={this.state.settings}/>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      margin: "10px auto",
                      left: 0,
                      right: 0,
                      textAlign:"center",
                    }}
                  >
                    {this.state.loadErr ? (
                      <div>{this.state.loadErr}</div>
                    ) : (
                      <CircularProgress
                        variant="determinate"
                        value={this.state.completed}
                      ></CircularProgress>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default withTranslation()(DbPowerUsage); 
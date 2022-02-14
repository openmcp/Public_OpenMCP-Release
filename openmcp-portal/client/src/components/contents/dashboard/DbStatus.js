import React, { Component } from "react";
import PieReChart from "../../modules/PieReChart";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Link } from "react-router-dom";
// import { NavigateNext } from "@material-ui/icons";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import { RiDashboardFill } from "react-icons/ri";
// import CustomDynamicView from "./CustomDynamicView";
import { withTranslation } from 'react-i18next';

class DbStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      loadErr: "",
      completed: 0,
      reRender: "",
      masterCluster: "",
      componentList: [],
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

  componentDidMount() {
    // this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);

    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-DS-VW01");
  }

  componentWillUnmount() {
    clearInterval(this.timer2);
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

    const response = await fetch(`/apis/dashboard/status`, requestOptions);
    const body = await response.json();
    return body;
  };

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
              this.setState({ loadErr: t("dashboard.connectionFailed") });
            }

            this.setState({ rows: "" });
          } else {
            this.setState({ rows: res });
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

  angle = {
    full: {
      startAngle: 0,
      endAngle: 360,
    },
    half: {
      startAngle: 0,
      endAngle: 180,
    },
  };

  render() {
    const {t} = this.props;
    return (
      <div className="">
        {/* 컨텐츠 내용 */}
        <div style={{ display: "flex", width: "100%" }}>
          {this.state.rows ? (
            [
              <DashboardCard01
                title={t("dashboard.systemStatus.clusters")}
                width="24%"
                data={this.state.rows.clusters}
                path="/clusters"
                angle={this.angle.full}
                btnDetail={t("dashboard.systemStatus.btn-info")} 
              ></DashboardCard01>,
              <DashboardCard01
                title={t("dashboard.systemStatus.nodes")}
                width="24%"
                data={this.state.rows.nodes}
                path="/nodes"
                angle={this.angle.full}
                btnDetail={t("dashboard.systemStatus.btn-info")}
              ></DashboardCard01>,
              <DashboardCard01
                title={t("dashboard.systemStatus.pods")}
                width="24%"
                data={this.state.rows.pods}
                path="/pods"
                angle={this.angle.full}
                btnDetail={t("dashboard.systemStatus.btn-info")}
              ></DashboardCard01>,
              <DashboardCard01
                title={t("dashboard.systemStatus.porjects")}
                width="24%"
                data={this.state.rows.projects}
                path="/projects"
                angle={this.angle.full}
                btnDetail={t("dashboard.systemStatus.btn-info")}
              ></DashboardCard01>,
            ]
          ) : ([
            <div className="content-box" style={{width:"100%"}}>
                <div className="cb-header">
                  <span>{t("dashboard.systemStatus.title")}</span>
                </div>
                <div
                  style={{
                    position: "relative",
                    margin: "20px 10px 10px",
                    textAlign: "center",
                    background: "#ffffff",
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
            </div>

            ]
          )}
        </div>
      </div>
    );
  }
}

class DashboardCard01 extends Component {
  onClickRf = () => {
    this.props.onClickRefresh();
  };
  render() {
    // const {t} = this.props;
    const colors = [
      "#0088FE",
      // "#00C49F",
      "#ff8042",
      "#FFBB28",
      "#cccccc",
      "#00C49F",
      "#FFBB28",
      "#00C49F",
      "#FFBB28",
    ];
    return (
      <div className="content-box" style={{ width: this.props.width }}>
        <div className="cb-header">
          <div onClick={this.onClickRf}></div>
          <span>{this.props.title}</span>
          <span> : {this.props.data.counts}</span>

          <Link to={this.props.path}>
            <div className="cb-btn">{this.props.btnDetail}</div>
          </Link>
        </div>
        <div
          className="cb-body"
          style={{ position: "relative", width: "100%" }}
        >
          <PieReChart
            data={this.props.data}
            angle={this.props.angle}
            colors={colors}
            unit=""
          ></PieReChart>
        </div>
      </div>
    );
  }
}

export default withTranslation()(DbStatus); 

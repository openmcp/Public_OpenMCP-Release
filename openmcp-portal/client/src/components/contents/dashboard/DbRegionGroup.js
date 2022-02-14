import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import TreeView2 from "../../modules/TreeView2";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import { withTranslation } from 'react-i18next';

class DbRegionGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      loadErr:"",
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
    this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });

    utilLog.fn_insertPLogs(userId, "log-DS-VW04");
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

    const response = await fetch(
      `/apis/dashboard/region_groups`,
      requestOptions
    );
    const body = await response.json();
    return body;
  };

  onRefresh = () => {
    const {t} = this.props;
    console.log("refresh", this.state.refreshCycle);
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
      <div className="dash-comp">
        {/* 컨텐츠 내용 */}

        <div style={{ display: "flex" }}>
          {/* <DashboardCard04
                   title="Cluster Regions"
                   // width="100%"
                   data={this.state.rows.regions}
                 ></DashboardCard04>
                */}
          <div className="content-box">
            <div className="cb-header">
              <span>{t("dashboard.regions.title")}</span>
              {/* <div className="cb-btn">
                      <Link to={this.props.path}>detail</Link>
                    </div> */}
            </div>
            <div
              className="cb-body"
              style={{ position: "relative", display: "flex" }}
            >
              {this.state.rows ? (
                [<TreeView2 data={this.state.rows.regions} />]
              ) : (
                <div  style={{
                  position:"relative",
                  margin: "10px auto",
                  left:0,
                  right:0,
                }}>
                {this.state.loadErr ? 
                  <div>{this.state.loadErr}</div>
                  :
                <CircularProgress
                  variant="determinate"
                  value={this.state.completed}
                 
                ></CircularProgress>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// class DashboardCard04 extends Component {
//   render() {
//     return (
//       <div className="content-box">
//         <div className="cb-header">
//           <span>{this.props.title}</span>
//           {/* <div className="cb-btn">
//           <Link to={this.props.path}>detail</Link>
//         </div> */}
//         </div>
//         <div
//           className="cb-body"
//           style={{ position: "relative", display: "flex" }}
//         >
//           <TreeView2 data={this.props.data} />
//         </div>
//       </div>
//     );
//   }
// }

export default withTranslation()(DbRegionGroup); 
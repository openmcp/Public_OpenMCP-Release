import { CircularProgress } from "@material-ui/core";
import { AsyncStorage } from "AsyncStorage";
import React, { Component } from "react";
import * as utilLog from "../../util/UtLogs.js";
import * as util from "../../util/Utility.js";
import { withTranslation } from "react-i18next";
// import './App.css';
import WorldMap from "react-svg-worldmap";

class DbWorldMapClusterStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapSize: Math.min(window.innerHeight - 363, window.innerWidth),
      rows: "",
      loadErr: "",
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

  onSizeUp = () => {
    let mapSize = this.state.mapSize;
    this.setState({ mapSize: mapSize + 100 });
  };

  onSizeDown = () => {
    let mapSize = this.state.mapSize;
    this.setState({ mapSize: mapSize - 100 });
  };

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
      `/apis/dashboard/world_cluster_map`,
      requestOptions
    );

    // apis/core.kubefed.io/v1beta1/namespaces/kube-federation-system/kubefedclusters
    const body = await response.json();
    return body;
  };

  componentDidMount() {
    this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });

    utilLog.fn_insertPLogs(userId, "log-DS-VW05");
  }

  onRefresh = () => {
    const { t } = this.props;
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

  componentWillUnmount() {
    clearInterval(this.timer2);
  }

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  render() {
    const { t } = this.props;
    // const data = [
    //   { country: "cn", value: 1 }, // china
    //   { country: "in", value: 2 }, // india
    //   { country: "us", value: 3 }, // united states
    //   { country: "id", value: 4 }, // indonesia
    //   { country: "pk", value: 5 }, // pakistan
    //   { country: "br", value: 6 }, // brazil
    //   { country: "ng", value: 7 }, // nigeria
    //   { country: "bd", value: 8 }, // bangladesh
    //   { country: "ru", value: 9 }, // russia
    //   { country: "kr", value: 10 }, // mexico
    // ];
    const stylingFunction = (context) => {
      const opacityLevel =
        0.3 +
        (1.5 * (context.countryValue - context.minValue)) /
          (context.maxValue - context.minValue);

      let ynNew = false;
      let values = this.state.rows;
      for (let i=0; i < values.length; i++){
        ynNew = false;
        
        if (values[i].country === context.countryCode) {
          // var date = new Date(item.created_time);
          var before5min = new Date(util.getDateBefore("m", 5));
          // before5min = new Date("2022-12-13 06:27:49");
          // if(values[i].country === 'US'){
          //   before5min = new Date("2020-12-13 06:27:47");
          // }
  
          var utcTime = new Date(
            util.convertUTCTime(
              new Date(values[i].created_time),
              "%Y-%m-%d %H:%M:%S",
              false
            )
          );

          if (utcTime > before5min) {
            ynNew = true;
          }

          break;
        }
      }
     

      return {
        fill: ynNew ? "#1FB476" : 
                !ynNew && (context.countryValue !== 0 && context.countryValue !== undefined) ? "#0088fe" : context.color,
        fillOpacity: opacityLevel,
        stroke: "#0088fe",
        strokeWidth: 1,
        strokeOpacity: 0.2,
        cursor: "pointer",
      };
    };

    return (
      <div className="dash-comp">
        <div
          className="content-box"
          style={{ width: this.props.width, display: "inline-block" }}
        >
          <div className="cb-header">
            <span>{t("dashboard.worldClusterMap.title")}</span>
            <div style={{ float: "right" }}>
              <button class="btn-worldmap-size" onClick={this.onSizeUp}>
                +
              </button>
              <button class="btn-worldmap-size" onClick={this.onSizeDown}>
                -
              </button>
            </div>
          </div>
          <div
            className="cb-body"
            style={{ position: "relative", width: "100%" }}
          >
            {this.state.rows ? (
              <div style={{ textAlign: "center"}}>
                <WorldMap
                  // color="#0088fe"
                  // title="Top 10 Populous Countries"
                  value-suffix="people"
                  // size="responsive"
                  size={this.state.mapSize}
                  // frame={true}
                  data={this.state.rows}
                  styleFunction={stylingFunction}
                />
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  margin: "20px 10px 10px",
                  textAlign: "center",
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
    );
  }
}

export default withTranslation()(DbWorldMapClusterStatus);

import { CircularProgress } from "@material-ui/core";
import React, { Component } from "react";
import MetricLineChart from "../module/MetricLineChart";
import MetricSelectBox from "../module/MetricSelectBox";
import * as utilLog from "./../../../util/UtLogs.js";
import { withTranslation } from 'react-i18next';
import { AsyncStorage } from "AsyncStorage";

class MetricNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectBoxData: "",
      row: "",
      node: "",
    };
  }

  callApiFirst = async () => {
    const response = await fetch(
      `/apis/metric/nodelist?cluster=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };

  callApi = async (node) => {
    const response = await fetch(
      `/apis/metric/nodeState?cluster=${this.props.cluster}&node=${node}`
    );
    const body = await response.json();
    return body;
  };

  onApiExcute = (node) => {
    this.callApi(node)
      .then((res) => {
        if (res === null) {
          this.setState({ row: {} });
        } else {
          let cpuLineTitles = [];
          let memoryLineTitles = [];
          if(res.cpuUsage.length > 0){
            Object.keys(res.cpuUsage[0]).forEach((key) => {
              if (key !== "unit" && key !== "time") {
                cpuLineTitles.push(key);
              }
            });
          }
          if(res.memoryUsage.length > 0 ){
            Object.keys(res.memoryUsage[0]).forEach((key) => {
              if (key !== "unit" && key !== "time") {
                memoryLineTitles.push(key);
              }
            });
          }

          this.setState({
            row: res,
            cpuLineTitles: cpuLineTitles,
            memoryLineTitles: memoryLineTitles,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    this.callApiFirst()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
         
          let selectBoxData = [];
          res.forEach((item) => {
            selectBoxData.push({ name: item, value: item });
          });
          this.setState({
            namespace: res[0],
            selectBoxData: selectBoxData,
          });
          this.onApiExcute(res[0]);
        }
      })
      .catch((err) => console.log(err));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.cluster !== prevProps.cluster) {
      this.callApiFirst()
        .then((res) => {
          this.setState({
            selectBoxData: "",
          });
          if (res === null) {
            this.setState({ rows: [] });
          } else {
            let selectBoxData = [];
            res.forEach((item) => {
              selectBoxData.push({ name: item, value: item });
            });
            this.setState({
              node: res[0],
              selectBoxData: selectBoxData,
            });
            this.onApiExcute(res[0]);
          }
        })
        .catch((err) => console.log(err));
    }
  }

  onSelectBoxChange = (data) => {
    this.setState({ node: data });
    this.onApiExcute(data);

    let userId = null;
    AsyncStorage.getItem("userName",(err, result) => {
      userId= result;
    })
    utilLog.fn_insertPLogs(userId, 'log-MM-CG03');
  };

  render() {
    const {t} = this.props;
    // const angle = {
    //   full: {
    //     startAngle: 0,
    //     endAngle: 360,
    //   },
    //   half: {
    //     startAngle: 180,
    //     endAngle: 0,
    //   },
    // };

    // const colors = ["#0088FE", "#ecf0f5"];
    // const colors = [
    //   "#00C49F",
    //   "#0088FE",
    //   "#ff8042",
    //   "#FFBB28",
    //   "#cccccc",
    //   "#00C49F",
    //   "#FFBB28",
    //   "#00C49F",
    //   "#FFBB28",
    // ];

    return (
      <div className="m-area node-metric">
        {this.state.row ? (
          [
            <div className="m-area-header">
              <span>{t("multipleMetrics.nodeMetric.title")}</span>
              {this.state.selectBoxData ? (
                <span
                  style={{ position: "relative", top: "-3px", right: "8px" }}
                >
                  <span
                    style={{ position: "relative", top: "8px", right: "0px" }}
                  >
                    {t("multipleMetrics.nodeMetric.lb-node")} :{" "}
                  </span>
                  {/* <div style={{padding:"10px 15px 0px 15px"}}> */}
                  <MetricSelectBox
                    rows={this.state.selectBoxData}
                    onSelectBoxChange={this.onSelectBoxChange}
                    defaultValue=""
                  ></MetricSelectBox>
                  {/* </div> */}
                </span>
              ) : null}
            </div>,
            <div className="m-left">
              <div className="m-area-body">
                <div className="m-linechart-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.nodeMetric.diskUsage")}</span>
                    </div>
                    <div className="m-c-body">
                      {this.state.row.diskState ? (
                        <MetricLineChart
                          rowData={this.state.row.diskState}
                          unit="GB"
                          name={["capacity", "usage"]}
                          title=""
                          color="#36A970"
                          width={"550px"}
                          height={"200px"}
                          cardinal={true}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "50px",
                            paddingTop: "70px",
                          }}
                        >
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            <div className="m-right">
              <div className="m-area-body">
                <div className="m-linechart-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.nodeMetric.networkUsage")}</span>
                    </div>
                    <div className="m-c-body">
                      {this.state.row.netState ? (
                        <MetricLineChart
                          rowData={this.state.row.netState}
                          unit="KB"
                          name={["rx", "tx"]}
                          title=""
                          color="#36A970"
                          width={"550px"}
                          height={"200px"}
                          cardinal={true}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "50px",
                            paddingTop: "70px",
                          }}
                        >
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            <div className="m-left">
              <div className="m-area-body">
                <div className="m-single-info-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>cpu</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.cpuCount.value}</span>
                    </div>
                  </div>
                  <div className="m-content" style={{ marginRight: "5px" }}>
                    <div className="m-c-header">
                      <span>memory</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.memoryCount.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            <div className="m-right">
              <div className="m-area-body">
                <div className="m-multiple-info-area">
                  <div className="m-content">
                    <div className="m-c-header" style={{ textAlign: "left" }}>
                      <span>{t("multipleMetrics.nodeMetric.podState.title")}</span>
                    </div>
                    <div className="m-c-body">
                      <span style={{ color: "#5500C4" }}>
                        quota : {this.state.row.podState.quota}
                      </span>
                      <span style={{ color: "#00C49F" }}>
                        running : {this.state.row.podState.running}
                      </span>
                      <span style={{ color: "#ff8042" }}>
                        abnormal : {this.state.row.podState.abnormal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>,

            <div className="m-left">
              <div className="m-area-body">
                <div className="m-linechart-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.nodeMetric.cpuUsage")}</span>
                    </div>
                    <div className="m-c-body">
                      {this.state.row.cpuUsage ? (
                        <MetricLineChart
                          rowData={this.state.row.cpuUsage}
                          unit="m"
                          name={this.state.cpuLineTitles}
                          title=""
                          color="#36A970"
                          width={"550px"}
                          height={"200px"}
                          cardinal={true}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "50px",
                            paddingTop: "70px",
                          }}
                        >
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            <div className="m-right">
              <div className="m-area-body">
                <div className="m-linechart-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.nodeMetric.memoryUsage")}</span>
                    </div>
                    <div className="m-c-body">
                      {this.state.row.memoryUsage ? (
                        <MetricLineChart
                          rowData={this.state.row.memoryUsage}
                          unit="mbi"
                          name={this.state.memoryLineTitles}
                          title=""
                          color="#36A970"
                          width={"550px"}
                          height={"200px"}
                          cardinal={true}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "50px",
                            paddingTop: "70px",
                          }}
                        >
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
          ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "absolute", left: "50%", marginTop: "20px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

export default withTranslation()(MetricNode); 

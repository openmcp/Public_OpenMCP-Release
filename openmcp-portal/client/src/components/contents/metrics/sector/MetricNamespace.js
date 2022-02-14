import { CircularProgress } from "@material-ui/core";
import { AsyncStorage } from "AsyncStorage";
import React, { Component } from "react";
import MetricLineNetworkChart from "../module/MetricLineNetworkChart";
import MetricPieChart from "../module/MetricPieChart";
import MetricRevsBarChart from "../module/MetricRevsBarChart";
import MetricSelectBox from "../module/MetricSelectBox";
import * as utilLog from "./../../../util/UtLogs.js";
import { withTranslation } from 'react-i18next';

class MetricNamespace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      row: "",
      selectBoxData:"",
      namespace : "",
    };
  }

  callApiFirst = async () => {
    const response = await fetch(
      `/apis/metric/namespacelist?cluster=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };


  callApi = async (namespace) => {
    const response = await fetch(
      `/apis/metric/namespaceState?cluster=${this.props.cluster}&namespace=${namespace}`
    );
    const body = await response.json();
    return body;
  };

  onApiExcute = (namespace) => {
    this.callApi(namespace)
      .then((res) => {
        if (res === null) {
          this.setState({ row: {} });
        } else {
          this.setState({
            row: res,
          });
        }
      })
      .catch((err) => console.log(err));

    // let userId = null;
    // AsyncStorage.getItem("userName",(err, result) => {
    //   userId= result;
    // })
    // utilLog.fn_insertPLogs(userId, 'log-MM-CM01');
  };

  componentDidMount() {
    this.callApiFirst()
      .then((res) => {
        if(res === null){
          this.setState({ rows: [] });
        } else {
          let selectBoxData = []
          res.forEach((item)=>{
            selectBoxData.push({name : item, value: item});
          })
          this.setState({ 
            namespace : res[0],
            selectBoxData: selectBoxData 
          });
          this.onApiExcute(res[0]);
        }
      })
      .catch((err) => console.log(err));
  };
   
  componentDidUpdate(prevProps, prevState) {
    if (this.props.cluster !== prevProps.cluster) {
      this.callApiFirst()
      .then((res) => {
        this.setState({ 
          selectBoxData: "" 
        });
        if(res === null){
          this.setState({ rows: [] });
        } else {
          let selectBoxData = []
          res.forEach((item)=>{
            selectBoxData.push({name : item, value: item});
          })
          this.setState({ 
            namespace : res[0],
            selectBoxData: selectBoxData 
          });
          this.onApiExcute(res[0]);
        }
      })
      .catch((err) => console.log(err));
    }
  }

  onSelectBoxChange = (data) => {
    this.setState({namespace : data});
    this.onApiExcute(data);

    let userId = null;
    AsyncStorage.getItem("userName",(err, result) => {
      userId= result;
    })
    utilLog.fn_insertPLogs(userId, 'log-MM-CG02');
  }

  render() {
    const {t} = this.props;
    const angle = {
      full: {
        startAngle: 0,
        endAngle: 360,
      },
      half: {
        startAngle: 180,
        endAngle: 0,
      },
    };

    // const colors = ["#0088FE", "#ecf0f5"];
    const colors = [
      // "#00C49F",
      "#0088FE",
      "#ff8042",
      // "#FFBB28",
      "#cccccc",
      // "#00C49F",
      // "#FFBB28",
      // "#00C49F",
      // "#FFBB28",
    ];
    const lineTitles = ["rx", "tx"];

    return (
      <div className="m-area namespace-metric">
        
        {this.state.row ? (
          [
            <div className="m-left">
              <div className="m-area-header">
                <span>{t("multipleMetrics.namespaceMetric.title")}</span>
                {this.state.selectBoxData ? (
                <span style={{position: "relative", top: "-3px", right: "8px"}}>
                  <span style={{position: "relative", top: "8px", right: "0px"}}>{t("multipleMetrics.namespaceMetric.lb-namespace")} : </span>
                  {/* <div style={{padding:"10px 15px 0px 15px"}}> */}
                    <MetricSelectBox rows={this.state.selectBoxData} onSelectBoxChange={this.onSelectBoxChange} defaultValue=""></MetricSelectBox>
                  {/* </div> */}
                </span>) : null }
              </div>
              <div className="m-area-body">
                <div className="m-single-info-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.pvc")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.volumeState.pvc_cnt}</span>
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.deployment")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.workloadState.deployment}</span>
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.replicaset")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.workloadState.replicaset}</span>
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.statefulset")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.workloadState.statefulset}</span>
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.service")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.serviceState.service}</span>
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.endpoint")}</span>
                    </div>
                    <div className="m-c-body">
                      <span>{this.state.row.serviceState.endpoint}</span>
                    </div>
                  </div>
                </div>

                <div className="m-secondline-area">
                  <div className="m-pie-area">
                    <div className="m-content">
                      <div className="m-c-header">
                        <span>{t("multipleMetrics.namespaceMetric.podState")}</span>
                      </div>
                      <div className="m-c-body">
                        {this.state.row.podState.hasOwnProperty("status") ? (
                          <MetricPieChart
                            data={this.state.row.podState}
                            angle={angle.full}
                            colors={colors}
                            unit=""
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "50px",
                              paddingTop: "50px",
                            }}
                          >
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="m-linechart-area">
                    <div className="m-content">
                      <div className="m-c-header">
                        <span>{t("multipleMetrics.namespaceMetric.networkState")}</span>
                      </div>
                      <div className="m-c-body">
                        {this.state.row.podState.hasOwnProperty("status") ? (
                          <MetricLineNetworkChart
                            rowData={this.state.row.netState}
                            syncId={"apiserver"}
                            unit="ms"
                            dataKey="latency"
                            name={lineTitles}
                            title=""
                            color="#36A970"
                            cardinal={true}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "50px",
                              paddingTop: "50px",
                            }}
                          >
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            <div className="m-right">
              <div className="m-area-header">
                <span>{t("multipleMetrics.namespaceMetric.lb-namespaceResourceUsage")}</span>
              </div>
              <div className="m-area-body">
                <div className="m-pie-area m-barchart-area">
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.cpuTop5")}</span>
                    </div>
                    <div className="m-c-body">
                      <MetricRevsBarChart
                        rowData={this.state.row.cpuTop5}
                        dataKey='usage'
                      />
                    </div>
                  </div>
                  <div className="m-content">
                    <div className="m-c-header">
                      <span>{t("multipleMetrics.namespaceMetric.memoryTop5")}</span>
                    </div>
                    <div className="m-c-body">
                      <MetricRevsBarChart
                        rowData={this.state.row.memoryTop5}
                        dataKey='usage'
                      />
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

export default withTranslation()(MetricNamespace); 

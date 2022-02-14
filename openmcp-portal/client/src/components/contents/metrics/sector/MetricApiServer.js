import { CircularProgress } from "@material-ui/core";
import React, { Component } from "react";
// import MetricLineChart from "../module/MetricLineChart";
// import MetricPieChart from "../module/MetricPieChart";
import MetricSyncLineChart from "../module/MetricSyncLineChart";
import { withTranslation } from 'react-i18next';

class MetricApiServer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
    };
  }

  callApi = async () => {
    const response = await fetch(
      `/apis/metric/apiServer?cluster=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };

  onApiExcute = () => {
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ row: {} });
        } else {
          this.setState({
            rows: res,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    this.onApiExcute();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.cluster !== prevProps.cluster) {
      this.onApiExcute();
    }
  }

  

  render() {
    const {t} = this.props;
    const lineTitles = ["requests_per_sec", "latency"];

    // const colors = [
    //   // "#00C49F",
    //   "#0088FE",
    //   "#ff8042",
    //   // "#FFBB28",
    //   // "#cccccc",
    //   // "#00C49F",
    //   // "#FFBB28",
    //   // "#00C49F",
    //   // "#FFBB28",
    // ];

    return (
      <div className="m-area api-server-metric">
        {this.state.rows ? (
          [
            <div className="m-area-header">
              <span>{t("multipleMetrics.apiServerMetric.title")}</span>
              {/* <span>{this.props.cluster}</span> */}
            </div>,
            <div className="m-area-body">
              <div className="m-line-chart-area">
                <div className="m-content">
                  <div className="m-c-header">
                    <span>{t("multipleMetrics.apiServerMetric.requestsPerSec")}</span>
                  </div>
                  <div className="m-c-body">
                    <MetricSyncLineChart
                    rowData={this.state.rows}
                    syncId ={"apiserver"}
                    unit="request"
                    dataKey="requests_per_sec"
                    name={lineTitles}
                    title=" "
                    color="#367fa9"
                    cardinal={true}
                  />
                  </div>
                </div>
                <div className="m-content">
                  <div className="m-c-header">
                    <span>{t("multipleMetrics.apiServerMetric.latency")}</span>
                  </div>
                  <div className="m-c-body">
                  <MetricSyncLineChart
                    rowData={this.state.rows}
                    syncId ={"apiserver"}
                    unit="ms"
                    dataKey="latency"
                    name={lineTitles}
                    title=""
                    color="#36A970"
                    cardinal={true}
                  />
                  </div>
                </div>
              </div>

            </div>
          ]) : (
            <CircularProgress
              variant="determinate"
              value={this.state.completed}
              style={{ position: "absolute", left: "50%", marginTop: "20px" }}
            ></CircularProgress>
          )
        }
      </div>
    );
  }
}

export default withTranslation()(MetricApiServer); 
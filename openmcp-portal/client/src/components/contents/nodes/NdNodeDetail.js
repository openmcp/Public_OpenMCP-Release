import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext } from "@material-ui/icons";
// import Paper from "@material-ui/core/Paper";
// import {
//   SearchState,
//   IntegratedFiltering,
//   PagingState,
//   IntegratedPaging,
//   SortingState,
//   IntegratedSorting,
// } from "@devexpress/dx-react-grid";
// import {
//   Grid,
//   Table,
//   Toolbar,
//   SearchPanel,
//   TableColumnResizing,
//   TableHeaderRow,
//   PagingPanel,
// } from "@devexpress/dx-react-grid-material-ui";
import NdTaintConfig from "./../modal/NdTaintConfig";
import PieReChart2 from "../../modules/PieReChart2";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import NdResourceConfig from "./../modal/NdResourceConfig";
import Confirm2 from "./../../modules/Confirm2";
import Button from "@material-ui/core/Button";
import ProgressTemp from "./../../modules/ProgressTemp";
import axios from "axios";
import PieReChartPowerRange from "../../modules/PieReChartPowerRange";
import LineReChart from "../../modules/LineReChart";
import { withTranslation } from "react-i18next";

class NdNodeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      completed: 0,
      reRender: "",
      propsRow: "",
    };
  }

  componentWillMount() {
    // this.props.menuData("none");
    if (this.props.location.state !== undefined) {
      this.setState({ propsRow: this.props.location.state.data });
    }
  }

  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-ND-VW02");
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    var param = this.props.match.params;
    const response = await fetch(
      `/nodes/${param.node}${this.props.location.search}`
    );
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  onUpdateData = () => {
    // console.log("onUpdateData={this.props.onUpdateData}");
    this.timer = setInterval(this.progress, 20);
    this.setState({ rows: "" });

    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }

        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { t } = this.props;
    // console.log("CsOverview_Render : ",this.state.rows.basic_info);
    return (
      <div>
        <div className="content-wrapper node-detail fulled">
          {/* 컨텐츠 헤더 */}
          <section className="content-header">
            <h1>
              {this.props.match.params.node}
              <small>
                <NavigateNext className="detail-navigate-next" />
                {t("nodes.detail.title")}
              </small>
            </h1>
            <ol className="breadcrumb">
              <li>
                <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
              </li>
              <li>
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                <NavLink to="/nodes">{t("nodes.title")}</NavLink>
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("nodes.detail.title")}
              </li>
            </ol>
          </section>

          {/* 내용부분 */}
          <section className="content">
            {this.state.rows ? (
              [
                <BasicInfo
                  rowData={this.state.rows.basic_info}
                  onUpdateData={this.onUpdateData}
                  propsRow={this.state.propsRow}
                  t={t}
                />,
                <KubernetesStatus
                  rowData={this.state.rows.kubernetes_node_status}
                  nodeData={this.state.rows.basic_info}
                  propsRow={this.state.propsRow}
                  t={t}
                />,
                <NodeResourceUsage
                  rowData={this.state.rows.node_resource_usage}
                  nodeData={this.state.rows.basic_info}
                  propsRow={this.state.propsRow}
                  t={t}
                />,
                <NodePowerUsage
                  nodeName={this.props.match.params.node}
                  query={this.props.location.search}
                  t={t}
                />,
                // <Events rowData={this.state.rows.events}/>
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </section>
        </div>
      </div>
    );
  }
}

class BasicInfo extends Component {
  onUpdateData = () => {
    this.props.onUpdateData();
  };
  render() {
    const t = this.props.t;
    return (
      <div className="content-box">
        <div className="cb-header">
          <span>{t("nodes.detail.basicInfo.title")}</span>
          <NdTaintConfig
            name={this.props.rowData.name}
            taints={this.props.rowData.taint}
            cluster={this.props.rowData.cluster}
            node={this.props.rowData.name}
            onUpdateData={this.onUpdateData}
            t={t}
          />
        </div>
        <div className="cb-body">
          <div>
            <span>{t("nodes.detail.basicInfo.sub.name")} : </span>
            <strong>{this.props.rowData.name}</strong>
          </div>
          <div style={{ display: "flex" }}>
            <div className="cb-body-left">
              <div>
                <span>{t("nodes.detail.basicInfo.sub.status")} : </span>
                <span
                  style={{
                    color:
                      this.props.rowData.status === "Healthy"
                        ? "#1ab726"
                        : this.props.rowData.status === "Unhealthy"
                        ? "red"
                        : this.props.rowData.status === "Unknown"
                        ? "#b5b5b5"
                        : "black",
                  }}
                >
                  {this.props.rowData.status}
                </span>
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.role")} : </span>
                {this.props.rowData.role}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.cluster")} : </span>
                {this.props.rowData.cluster}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.version")} : </span>
                {this.props.rowData.kubernetes}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.proxy")} : </span>
                {this.props.rowData.kubernetes_proxy}
              </div>
            </div>
            <div className="cb-body-right">
              <div>
                <span>{t("nodes.detail.basicInfo.sub.ip")} : </span>
                {this.props.rowData.ip}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.os")} : </span>
                {this.props.rowData.os}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.docker")} : </span>
                {this.props.rowData.docker}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.createdTime")}: </span>
                {this.props.rowData.created_time}
              </div>
              <div>
                <span>{t("nodes.detail.basicInfo.sub.provider")} : </span>
                {this.props.propsRow.provider}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class KubernetesStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: this.props.rowData,
      confirmType: "",
      confirmOpen: false,
      confirmInfo: {
        title: this.props.t("nodes.detail.nodeStatus.pop-powerStart.title"),
        context: this.props.t("nodes.detail.nodeStatus.pop-powerStart.context"),
        button: {
          open: "",
          yes: this.props.t("common.btn.confirm"),
          no: this.props.t("common.btn.cancel"),
        },
      },
      confrimTarget: "",
      confirmTargetKeyname: "",
      powerflag: "on",
    };
  }

  handleClickStart = () => {
    this.setState({
      confirmType: "power",
      confirmOpen: true,
      powerFlag: "on",
      confirmInfo: {
        title: this.props.t("nodes.detail.nodeStatus.pop-powerStart.title"),
        context: this.props.t("nodes.detail.nodeStatus.pop-powerStart.context"),
        button: {
          open: "",
          yes: this.props.t("common.btn.confirm"),
          no: this.props.t("common.btn.cancel"),
        },
      },
    });
  };

  handleClickStop = () => {
    this.setState({
      confirmType: "power",
      confirmOpen: true,
      powerFlag: "off",
      confirmInfo: {
        title: this.props.t("nodes.detail.nodeStatus.pop-powerOff.title"),
        context: this.props.t("nodes.detail.nodeStatus.pop-powerOff.context"),
        button: {
          open: "",
          yes: this.props.t("common.btn.confirm"),
          no: this.props.t("common.btn.cancel"),
        },
      },
    });
  };

  handleClickDelete = () => {
    this.setState({
      confirmType: "delete",
      confirmOpen: true,
      confirmInfo: {
        title: this.props.t("nodes.detail.nodeStatus.pop-deleteNode.title"),
        context: this.props.t("nodes.detail.nodeStatus.pop-deleteNode.context"),
        button: {
          open: "",
          yes: this.props.t("common.btn.confirm"),
          no: this.props.t("common.btn.cancel"),
        },
      },
    });
  };

  //callback
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    //show progress loading...
    this.setState({ openProgress: true });
    const provider = this.props.propsRow.provider;
    let data = {};
    let url = "";
    let logType = "";

    if (result) {
      if (this.state.confirmType === "power") {
        if (this.state.powerFlag === "on") {
          url = `/nodes/${provider}/start`;
          logType = "log-ND-EX01";
        } else if (this.state.powerFlag === "off") {
          url = `/nodes/${provider}/stop`;
          logType = "log-ND-EX02";
        }

        if (provider === "EKS") {
          //eks
          data = {
            region: "ap-northeast-2",
            node: "ip-172-31-0-123.ap-northeast-2.compute.internal",
            cluster: "eks-cluster1",

            // region: this.props.propsRow.region,
            // node: this.props.propsRow.name,
            // cluster : this.props.propsRow.cluster
          };
        } else if (provider === "AKS") {
          data = {
            // cluster : this.props.propsRow.cluster,
            // node : this.props.propsRow.name,
            cluster: "aks-cluster-01",
            node: "aks-np01-47695231-vmss_4",
          };
        } else if (provider === "KVM" || provider === "On-Premise") {
          data = {
            cluster: this.props.propsRow.cluster,
            node: this.props.propsRow.name,
          };
        } else {
          alert(provider + " is not supported Type");
          this.setState({ openProgress: false });
          return;
        }
      } else if (this.state.confirmType === "delete") {
        url = `/nodes/delete/kvm`;
        data = {
          cluster: this.props.propsRow.cluster,
          node: this.props.propsRow.name,
        };
        logType = "log-ND-EX03";
      }

      axios
        .post(url, data)
        .then((res) => {
          if (res.data.error) {
            // alert(res.data.message);
          } else {
            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });
            utilLog.fn_insertPLogs(userId, logType);
          }
        })
        .catch((err) => {
          console.log(err);
        });

      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: false });
    }
  };

  render() {
    const t = this.props.t;
    return (
      <div className="content-box cb-kube-status">
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}
        <Confirm2
          confirmInfo={this.state.confirmInfo}
          confrimTarget={this.state.confrimTarget}
          confirmTargetKeyname={this.state.confirmTargetKeyname}
          confirmed={this.confirmed}
          confirmOpen={this.state.confirmOpen}
        />

        <div className="cb-header">
          <span>{t("nodes.detail.nodeStatus.title")}</span>
          {this.props.propsRow.provider === "KVM" || this.props.propsRow.provider === "On-Premise" ? (
            <div style={{ position: "absolute", top: "0px", right: "0px" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleClickStart}
                style={{
                  marginRight: "10px",
                  zIndex: "10",
                  width: "148px",
                  height: "31px",
                  textTransform: "capitalize",
                }}
              >
                {t("nodes.detail.nodeStatus.btn-startNode")}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleClickStop}
                style={{
                  zIndex: "10",
                  width: "148px",
                  height: "31px",
                  textTransform: "capitalize",
                }}
              >
                {t("nodes.detail.nodeStatus.btn-stopNode")}
              </Button>

              {this.props.propsRow.provider === "KVM" || this.props.propsRow.provider === "On-Premise" ? (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.handleClickDelete}
                  style={{
                    marginLeft: "10px",
                    zIndex: "10",
                    width: "148px",
                    height: "31px",
                    textTransform: "capitalize",
                  }}
                >
                  {t("nodes.detail.nodeStatus.btn-deleteNode")}
                </Button>
              ) : (
                ""
              )}
            </div>
          ) : null}
        </div>
        <div className="cb-body flex">
          {this.state.rows.map((item) => {
            return (
              <div className={"cb-body-content " + item.status}>
                <div>{item.name}</div>
                <div>({item.status})</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class NodeResourceUsage extends Component {
  state = {
    rows: this.props.rowData,
    nodeData: this.props.nodeData,
  };
  angle = {
    full: {
      startAngle: 0,
      endAngle: 360,
    },
    half: {
      startAngle: 180,
      endAngle: 0,
    },
  };
  render() {
    const t = this.props.t;
    const colors = ["#0088FE", "#ecf0f5"];
    return (
      <div className="content-box">
        <div className="cb-header">
          <span> {t("nodes.detail.resourceUsage.title")}</span>
          {this.props.propsRow.provider === "EKS" ||
          this.props.propsRow.provider === "KVM" || this.props.propsRow.provider === "On-Premise"? (
            <NdResourceConfig
              rows={this.state.rows}
              rowData={this.props.rowData}
              nodeData={this.props.nodeData}
              onUpdateData={this.props.onUpdateData}
              propsRow={this.props.propsRow}
            />
          ) : (
            ""
          )}
        </div>
        <div className="cb-body flex">
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">CPU</div>
            <PieReChart2
              data={this.state.rows.cpu}
              angle={this.angle.half}
              unit={this.state.rows.cpu.unit}
              colors={colors}
            ></PieReChart2>
          </div>
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">Memory</div>
            <PieReChart2
              data={this.state.rows.memory}
              angle={this.angle.half}
              unit={this.state.rows.memory.unit}
              colors={colors}
            ></PieReChart2>
          </div>
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">Storage</div>
            <PieReChart2
              data={this.state.rows.storage}
              angle={this.angle.half}
              unit={this.state.rows.storage.unit}
              colors={colors}
            ></PieReChart2>
          </div>
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">Pod</div>
            <PieReChart2
              data={this.state.rows.pods}
              angle={this.angle.half}
              unit={this.state.rows.pods.unit}
              colors={colors}
            ></PieReChart2>
          </div>
        </div>
      </div>
    );
  }
}

class NodePowerUsage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      range: "",
      rows: "",
      timeline: "",
      settings: {
        width: 200,
        height: 150,
        cx: 98,
        cy: 90,
        outerRadius: 80,
        innerRadius: 45,
        startAngle: 200,
        endAngle: -20,
        minHeight: "200px",
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
    const response = await fetch(
      `/nodes/${this.props.nodeName}/power-usage${this.props.query}`
    );
    const body = await response.json();
    return body;
  };

  componentDidMount() {
    // this.timer2 = setInterval(this.onRefresh, this.state.refreshCycle);
    this.timer = setInterval(this.progress, 20);
    this.onRefresh();
  }

  onRefresh = () => {
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          if (res.hasOwnProperty("errno")) {
            if (res.code === "ECONNREFUSED") {
              clearInterval(this.timer2);
              this.setState({ loadErr: "Connection Failed" });
            }

            this.setState({ rows: "", range: "", timeline: "" });
          } else {
            this.setState({
              rows: res.rows,
              range: res.range,
              timeline: res.timeline,
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

  // componentWillUnmount() {
  //   clearInterval(this.timer2);
  // }

  render() {
    const t = this.props.t;
    return (
      <div className="content-box">
        <div className="cb-header">
          <span>{t("nodes.detail.powerUsage.title")}</span>
          {/* <div className="cb-btn">
                      <Link to={this.props.path}>detail</Link>
                    </div> */}
        </div>
        <div className="cb-body flex" style={{ position: "relative" }}>
          {this.state.rows ? (
            [
              <div style={{ margin: "0 70px" }}>
                <PieReChartPowerRange
                  range={this.state.range}
                  data={this.state.rows}
                  settings={this.state.settings}
                />
              </div>,
              <LineReChart
                rowData={this.state.timeline}
                unit="watt"
                name="usage"
                title="Power Usage"
                cardinal={false}
              ></LineReChart>,
            ]
          ) : (
            <div
              style={{
                position: "relative",
                margin: "10px auto",
                left: 0,
                right: 0,
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
    );
  }
}

export default withTranslation()(NdNodeDetail);

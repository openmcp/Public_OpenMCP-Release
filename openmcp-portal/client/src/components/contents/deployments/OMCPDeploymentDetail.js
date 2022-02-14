import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext } from "@material-ui/icons";
import { Link } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
// import axios from "axios";
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from "@devexpress/dx-react-grid";
// import LineReChart from "./../../modules/LineReChart";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import { FaCube } from "react-icons/fa";
// import PdPodResourceConfig from "../modal/PdPodResourceConfig.js";
import { withTranslation } from "react-i18next";

let apiParams = "";
class OMCPDeploymentDetail extends Component {
  state = {
    rows: "",
    completed: 0,
    reRender: "",
  };

  componentWillMount() {
    apiParams = this.props.match.params;
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
        utilLog.fn_insertPLogs(userId, "log-DP-VW04");
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    var param = this.props.match.params;
    const response = await fetch(
      `/deployments/omcp-deployment/${param.deployment}${this.props.location.search}`
    );
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  refresh = () => {
    this.timer = setInterval(this.progress, 20);
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
    return (
      <div>
        <div className="content-wrapper pj-deployments fulled">
          {/* 컨텐츠 헤더 */}
          <section className="content-header" onClick={this.onRefresh}>
            <h1>
              {this.props.match.params.deployment}
              <small>
                <NavigateNext className="detail-navigate-next" />
                {t("deployments.detail.title")}
              </small>
            </h1>
            <ol className="breadcrumb">
              <li>
                <Link to="/dashboard">{t("common.nav.home")}</Link>
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("deployments.title")}
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("deployments.detail.title")}
              </li>
            </ol>
          </section>
          {/* 내용부분 */}
          <section className="content">
            {this.state.rows ? (
              [
                <BasicInfo
                  rowData={this.state.rows.basic_info}
                  refresh={this.refresh}
                  t={t}
                />,
                <ReplicaStatus
                  refresh={this.refresh}
                  queryString={this.props.location.search}
                  replica={this.state.rows.basic_info.status}
                  t={t}
                />,
                <Pods rowData={this.state.rows.pods} t={t} />,
                <Ports rowData={this.state.rows.ports} t={t} />,
                // <PhysicalResources
                //   rowData={this.state.rows.physical_resources}
                // />,
                <Events rowData={this.state.rows.events} t={t} />,
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
  render() {
    const t = this.props.t;
    return (
      <div className="content-box">
        <div className="cb-header">
          <span>{t("deployments.detail.basicInfo.title")}</span>
          {/* <PdPodResourceConfig
            data={this.props.rowData}
            refresh={this.props.refresh}
          /> */}
        </div>
        <div className="cb-body">
          <div style={{ display: "flex" }}>
            <div className="cb-body-left">
              <div>
                <span>{t("deployments.detail.basicInfo.name")} : </span>
                <strong>{this.props.rowData.name}</strong>
              </div>
              <div>
                <span>{t("deployments.detail.basicInfo.project")} : </span>
                {this.props.rowData.project}
              </div>
              <div>
                <span>{t("deployments.detail.basicInfo.replica")} : </span>
                {this.props.rowData.status}
              </div>
              {/* <div>
                <span>{t("deployments.detail.basicInfo.labels")} : </span>
                <div style={{ margin: "-25px 0px 0px 66px" }}>
                  {Object.keys(this.props.rowData.labels).length > 0
                    ? Object.entries(this.props.rowData.labels).map((i) => {
                        return <div>{i.join(" : ")}</div>;
                      })
                    : "-"}
                </div>
              </div> */}
            </div>
            <div className="cb-body-right">
              <div>
                <span>{t("deployments.detail.basicInfo.kind")} : </span>
                {this.props.rowData.kind}
              </div>
              <div>
                <span>{t("deployments.detail.basicInfo.createdTime")} : </span>
                {this.props.rowData.created_time}
              </div>
              <div>
                <span>{t("deployments.detail.basicInfo.uid")} : </span>
                {this.props.rowData.uid}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ReplicaStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(
      `/projects/${
        this.props.queryString.split("project=")[1]
      }/resources/workloads/deployments/omcp-deployment/${
        apiParams.deployment
      }/replica_status${this.props.queryString}`
    );

    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  repeatCallApi = () => {
    console.log("repeat");
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          this.setState({
            rows: res,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  //컴포넌트가 모두 마운트가 되었을때 실행된다.
  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          this.setState({
            rows: res,
          });
        }
      })
      .catch((err) => console.log(err));
    // this.timer = setInterval(this.repeatCallApi, 20000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const t = this.props.t;
    const rectangle = (status, pId) => {
      return [
        <div>
          <FaCube
            className="cube"
            style={{
              color: status === "ready" ? "#367fa9" : "#C4C4C4",
            }}
          />
        </div>,
        // <div className="rectangle"
        //   id={pId}
        //   style={{
        //     backgroundColor: status === "ready" ? "#367fa9" : "orange",
        //   }}

        // />
      ];
    };

    return (
      <div className="content-box replica-set">
        <div className="cb-header">
          {t("deployments.detail.replicaStatus.title") +
            " (" +
            t("deployments.detail.replicaStatus.total") +
            " : " +
            this.props.replica +
            ")"}
        </div>
        <div className="cb-body" style={{ width: "100%" }}>
          <div>
            {this.state.rows ? (
              this.state.rows.map((item, index) => {
                return (
                  <div className="rs-cluster">
                    <div
                      className="cluster-title"
                      style={{
                        backgroundColor:
                          parseInt(item.replicas) === 0 ? "#C4C4C4" : "#2877a5",
                      }}
                    >
                      {item.cluster}
                    </div>
                    <div className="cluster-content">
                      <div
                        className="pod-count"
                        style={{ marginBottom: "17px" }}
                      >
                        <span
                          style={{
                            fontSize: "19px",
                            color:
                              parseInt(item.replicas) === 0
                                ? "#C4C4C4"
                                : "#000000",
                          }}
                        >
                          Pods : {item.replicas}
                        </span>
                      </div>
                      {parseInt(item.replicas) === 0 ? (
                        <div>{rectangle("none")}</div>
                      ) : (
                        [...Array(parseInt(item.replicas))].map((n, index) => {
                          return <div>{rectangle("ready")}</div>;
                        })
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </div>
        </div>
      </div>
    );
  }
}

class Pods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 330 },
        { columnName: "status", width: 100 },
        { columnName: "cluster", width: 100 },
        { columnName: "project", width: 130 },
        { columnName: "pod_ip", width: 120 },
        { columnName: "node", width: 230 },
        { columnName: "node_ip", width: 130 },
        // { columnName: "cpu", width: 80 },
        // { columnName: "memory", width: 100 },
        { columnName: "created_time", width: 170 },
      ],
      rows: this.props.rowData,

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
    };
  }

  componentWillMount() {}

  componentDidUpdate(prevProps, prevState) {
    console.log("pods update");
    if (this.props.rowData !== prevProps.rowData) {
      this.setState({
        ...this.state,
        rows: this.props.rowData,
      });
    }
  }
  render() {
    const t = this.props.t;
    const columns = [
      { name: "name", title: t("pods.pod.grid.name") },
      { name: "status", title: t("pods.pod.grid.status") },
      { name: "cluster", title: t("pods.pod.grid.cluster") },
      { name: "project", title: t("pods.pod.grid.project") },
      { name: "pod_ip", title: t("pods.pod.grid.podIp") },
      { name: "node", title: t("pods.pod.grid.node") },
      { name: "node_ip", title: t("pods.pod.grid.nodeIp") },
      // { name: "cpu", title: "CPU" },
      // { name: "memory", title: "Memory" },
      { name: "created_time", title: t("pods.pod.grid.createdTime") },
    ];

    // 셀 데이터 스타일 변경
    const HighlightedCell = ({ value, style, row, ...restProps }) => (
      <Table.Cell
        {...restProps}
        style={{
          // backgroundColor:
          //   value === "Healthy" ? "white" : value === "Unhealthy" ? "white" : undefined,
          // cursor: "pointer",
          ...style,
        }}
      >
        <span
          style={{
            color:
              value === "Pending"
                ? "orange"
                : value === "Failed"
                ? "red"
                : value === "Unknown"
                ? "#b5b5b5"
                : value === "Succeeded"
                ? "skyblue"
                : value === "Running"
                ? "#1ab726"
                : "black",
          }}
        >
          <FiberManualRecordSharpIcon
            style={{
              fontSize: 12,
              marginRight: 4,
              backgroundColor:
                value === "Running"
                  ? "rgba(85,188,138,.1)"
                  : value === "Succeeded"
                  ? "rgba(85,188,138,.1)"
                  : value === "Failed"
                  ? "rgb(152 13 13 / 10%)"
                  : value === "Unknown"
                  ? "rgb(255 255 255 / 10%)"
                  : value === "Pending"
                  ? "rgb(109 31 7 / 10%)"
                  : "white",
              boxShadow:
                value === "Running"
                  ? "0 0px 5px 0 rgb(85 188 138 / 36%)"
                  : value === "Succeeded"
                  ? "0 0px 5px 0 rgb(85 188 138 / 36%)"
                  : value === "Failed"
                  ? "rgb(188 85 85 / 36%) 0px 0px 5px 0px"
                  : value === "Unknown"
                  ? "rgb(255 255 255 / 10%)"
                  : value === "Pending"
                  ? "rgb(188 114 85 / 36%) 0px 0px 5px 0px"
                  : "white",
              borderRadius: "20px",
              // WebkitBoxShadow: "0 0px 1px 0 rgb(85 188 138 / 36%)",
            }}
          ></FiberManualRecordSharpIcon>
        </span>
        <span
          style={{
            color:
              value === "Pending"
                ? "orange"
                : value === "Failed"
                ? "red"
                : value === "Unknown"
                ? "#b5b5b5"
                : value === "Succeeded"
                ? "skyblue"
                : value === "Running"
                ? "#1ab726"
                : "black",
          }}
        >
          {value}
        </span>
      </Table.Cell>
    );

    //셀
    const Cell = (props) => {
      const { column, row } = props;
      // console.log("cell : ", props);
      // const values = props.value.split("|");
      // console.log("values", props.value);

      // const values = props.value.replace("|","1");
      // console.log("values,values", values)

      const fnEnterCheck = () => {
        if (props.value === undefined) {
          return "";
        } else {
          return props.value.indexOf("|") > 0
            ? props.value.split("|").map((item) => {
                return <p>{item}</p>;
              })
            : props.value;
        }
      };

      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        // console.log("name", props.value);
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/pods/${props.value}/overview`,
                search: `cluster=${row.cluster}&project=${row.project}`,
                state: {
                  data: row,
                },
              }}
            >
              {fnEnterCheck()}
            </Link>
          </Table.Cell>
        );
      }

      return <Table.Cell>{fnEnterCheck()}</Table.Cell>;
    };

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );
    const Row = (props) => {
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    return (
      <div className="content-box">
        <div className="cb-header">{t("deployments.detail.pods.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                  // defaultSorting={[{ columnName: 'status', direction: 'desc' }]}
                  />
                  <IntegratedSorting />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* 테이블 */}
                  <Table rowComponent={Row} cellComponent={Cell} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>,
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </Paper>
        </div>
      </div>
    );
  }
}

class Ports extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "port_name", width: 200 },
        { columnName: "port", width: 150 },
        // { columnName: "listening_port", width: 150 },
        { columnName: "protocol", width: 150 },
      ],
      rows: this.props.rowData,

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
    };
  }

  componentWillMount() {}

  render() {
    const t = this.props.t;
    const columns = [
      { name: "port_name", title: t("deployments.detail.ports.grid.name") },
      { name: "port", title: t("deployments.detail.ports.grid.port") },
      // { name: "listening_port", title: "Listening Port" },
      { name: "protocol", title: t("deployments.detail.ports.grid.protocol") },
    ];
    // 셀 데이터 스타일 변경
    const HighlightedCell = ({ value, style, row, ...restProps }) => (
      <Table.Cell
        {...restProps}
        style={{
          // backgroundColor:
          //   value === "Healthy" ? "white" : value === "Unhealthy" ? "white" : undefined,
          // cursor: "pointer",
          ...style,
        }}
      >
        <span
          style={{
            color:
              value === "Pending"
                ? "orange"
                : value === "Failed"
                ? "red"
                : value === "Unknown"
                ? "red"
                : value === "Succeeded"
                ? "skyblue"
                : value === "Running"
                ? "#1ab726"
                : "black",
          }}
        >
          {value}
        </span>
      </Table.Cell>
    );

    //셀
    const Cell = (props) => {
      const { column, row } = props;
      // console.log("cell : ", props);
      // const values = props.value.split("|");
      // console.log("values", props.value);

      // const values = props.value.replace("|","1");
      // console.log("values,values", values)

      const fnEnterCheck = () => {
        if (props.value === undefined) {
          return "";
        } else {
          return props.value.indexOf("|") > 0
            ? props.value.split("|").map((item) => {
                return <p>{item}</p>;
              })
            : props.value;
        }
      };

      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        // console.log("name", props.value);
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/pods/${props.value}`,
                search: `cluster=${row.cluster}&project=${row.project}`,
                state: {
                  data: row,
                },
              }}
            >
              {fnEnterCheck()}
            </Link>
          </Table.Cell>
        );
      }

      return <Table.Cell>{fnEnterCheck()}</Table.Cell>;
    };

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );
    const Row = (props) => {
      // console.log("row!!!!!! : ",props);
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    return (
      <div className="content-box">
        <div className="cb-header">{t("deployments.detail.ports.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                  // defaultSorting={[{ columnName: 'status', direction: 'desc' }]}
                  />
                  <IntegratedSorting />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* 테이블 */}
                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>,
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </Paper>
        </div>
      </div>
    );
  }
}

// class PhysicalResources extends Component {
//   render() {
//     const network_title = ["in", "out"];
//     return (
//       <div className="content-box line-chart">
//         <div className="cb-header">Physical Resources</div>
//         <div className="cb-body">
//           <div className="cb-body-content">
//             <LineReChart
//               rowData={this.props.rowData.cpu}
//               unit="m"
//               name="cpu"
//               title="CPU"
//               cardinal={false}
//             ></LineReChart>
//           </div>
//           <div className="cb-body-content">
//             <LineReChart
//               rowData={this.props.rowData.memory}
//               unit="mib"
//               name="memory"
//               title="Memory"
//               cardinal={false}
//             ></LineReChart>
//           </div>
//           <div className="cb-body-content">
//             <LineReChart
//               rowData={this.props.rowData.network}
//               unit="Bps"
//               name={network_title}
//               title="Network"
//               cardinal={true}
//             ></LineReChart>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "project", width: 150 },
        { columnName: "type", width: 150 },
        { columnName: "reason", width: 150 },
        { columnName: "object", width: 240 },
        { columnName: "message", width: 440 },
        { columnName: "time", width: 180 },
      ],
      rows: this.props.rowData,

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
    };
  }

  componentWillMount() {}
  render() {
    const t = this.props.t;
    const columns = [
      { name: "project", title: t("deployments.detail.events.grid.project") },
      { name: "type", title: t("deployments.detail.events.grid.type") },
      { name: "reason", title: t("deployments.detail.events.grid.reason") },
      { name: "object", title: t("deployments.detail.events.grid.object") },
      { name: "message", title: t("deployments.detail.events.grid.message") },
      { name: "time", title: t("deployments.detail.events.grid.time") },
    ];

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );
    const Row = (props) => {
      // console.log("row!!!!!! : ",props);
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    return (
      <div className="content-box">
        <div className="cb-header">{t("deployments.detail.events.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                  // defaultSorting={[{ columnName: 'status', direction: 'desc' }]}
                  />
                  <IntegratedSorting />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* 테이블 */}
                  <Table rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>,
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </Paper>
        </div>
      </div>
    );
  }
}

export default withTranslation()(OMCPDeploymentDetail);

import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext } from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";
// import LineChart from './../../../modules/LineChart';
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from "@devexpress/dx-react-grid";
import LineReChart from "./../../../modules/LineReChart";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
// import PdPodResourceConfig from './../../modal/PdPodResourceConfig';
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import { withTranslation } from "react-i18next";

// let apiParams = "";
class PjPodDetail extends Component {
  state = {
    rows: "",
    completed: 0,
    reRender: "",
  };

  componentWillMount() {
    const result = {
      menu: "projects",
      title: this.props.match.params.project,
      pathParams: {
        searchString: this.props.location.search,
        project: this.props.match.params.project,
      },
    };
    this.props.menuData(result);
    // apiParams = this.props.match.params.project;
  }

  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if (res == null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-PJ-VW13");
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    var param = this.props.match.params;
    // const response = await fetch(`/projects/${param.project}/resources/pods/${param.pod}${this.props.location.search}`);
    const response = await fetch(
      `/pods/${param.pod}${this.props.location.search}`
    );
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  render() {
    const { t } = this.props;
    return (
      <div>
        <div className="content-wrapper pod-detail">
          {/* 컨텐츠 헤더 */}
          <section className="content-header">
            <h1>
              {this.props.match.params.pod}
              <small>
                <NavigateNext className="detail-navigate-next" />
                {t("pods.pod.detail.title")}
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
                <NavLink to="/projects">{t("projects.title")}</NavLink>
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("projects.detail.resources.title")}
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("projects.detail.resources.pods.title")}
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("pods.pod.detail.title")}
              </li>
            </ol>
          </section>

          {/* 내용부분 */}
          <section className="content">
            {this.state.rows ? (
              [
                <BasicInfo rowData={this.state.rows.basic_info} t={t} />,
                <PodStatus rowData={this.state.rows.pod_status} t={t} />,
                <Containers rowData={this.state.rows.containers} t={t} />,
                <PhysicalResources
                  rowData={this.state.rows.physical_resources}
                  t={t}
                />,
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
          <span>{t("pods.pod.detail.basicInfo.title")}</span>
          {/* <PdPodResourceConfig name={this.props.rowData.name} resources={this.props.rowData.resources}/> */}
          {/* <PdPodResourceConfig
            data={this.props.rowData}
            refresh={this.props.refresh}
          /> */}
        </div>
        <div className="cb-body">
          <div>
            <span>Name : </span>
            <strong>{this.props.rowData.name}</strong>
          </div>
          <div style={{ display: "flex" }}>
            <div className="cb-body-left">
              <div>
                <span>Status : </span>
                <span
                  style={{
                    color:
                      this.props.rowData.status === "Pending"
                        ? "orange"
                        : this.props.rowData.status === "Failed"
                        ? "red"
                        : this.props.rowData.status === "Unknown"
                        ? "#b5b5b5"
                        : this.props.rowData.status === "Succeeded"
                        ? "skyblue"
                        : this.props.rowData.status === "Running"
                        ? "#1ab726"
                        : "black",
                  }}
                >
                  {this.props.rowData.status}
                </span>
              </div>
              <div>
                <span>Cluster : </span>
                {this.props.rowData.cluster}
              </div>
              <div>
                <span>Project : </span>
                {this.props.rowData.project}
              </div>
              <div>
                <span>Node : </span>
                {this.props.rowData.node}
              </div>
              <div>
                <span>Total Restart Count : </span>
                {this.props.rowData.total_restart_count}
              </div>
            </div>
            <div className="cb-body-right">
              <div>
                <span>namespace : </span>
                {this.props.rowData.namespace}
              </div>
              <div>
                <span>Node IP : </span>
                {this.props.rowData.node_ip}
              </div>
              <div>
                <span>Pod IP : </span>
                {this.props.rowData.pod_ip}
              </div>
              <div>
                <span>Created Time : </span>
                {this.props.rowData.created_time}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Containers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
        { name: "status", title: "Status" },
        { name: "restart_count", title: "Restart Count" },
        { name: "port", title: "Port" },
        { name: "image", title: "Image" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 400 },
        { columnName: "status", width: 150 },
        { columnName: "restart_count", width: 150 },
        { columnName: "port", width: 150 },
        { columnName: "image", width: 280 },
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

  componentWillMount() {
    // this.props.onSelectMenu(false, "");
  }

  // callApi = async () => {
  //   const response = await fetch("/clusters");
  //   const body = await response.json();
  //   return body;
  // };

  // progress = () => {
  //   const { completed } = this.state;
  //   this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  // };

  // //컴포넌트가 모두 마운트가 되었을때 실행된다.
  // componentDidMount() {
  //   //데이터가 들어오기 전까지 프로그래스바를 보여준다.
  //   this.timer = setInterval(this.progress, 20);
  //   this.callApi()
  //     .then((res) => {
  //       this.setState({ rows: res });
  //       clearInterval(this.timer);
  //     })
  //     .catch((err) => console.log(err));
  // };

  render() {
    const t = this.props.t;
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
        <div className="cb-header">{t("pods.pod.detail.containers.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={this.state.columns}>
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

class PodStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "type", title: "Type" },
        { name: "status", title: "Status" },
        { name: "last_update", title: "Last Update" },
        { name: "reson", title: "Reson" },
        { name: "message", title: "Message" },
      ],
      defaultColumnWidths: [
        { columnName: "type", width: 150 },
        { columnName: "status", width: 150 },
        { columnName: "last_update", width: 150 },
        { columnName: "reson", width: 240 },
        { columnName: "message", width: 280 },
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

  componentWillMount() {
    // this.props.onSelectMenu(false, "");
  }

  // callApi = async () => {
  //   const response = await fetch("/clusters");
  //   const body = await response.json();
  //   return body;
  // };

  // progress = () => {
  //   const { completed } = this.state;
  //   this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  // };

  // //컴포넌트가 모두 마운트가 되었을때 실행된다.
  // componentDidMount() {
  //   //데이터가 들어오기 전까지 프로그래스바를 보여준다.
  //   this.timer = setInterval(this.progress, 20);
  //   this.callApi()
  //     .then((res) => {
  //       this.setState({ rows: res });
  //       clearInterval(this.timer);
  //     })
  //     .catch((err) => console.log(err));
  // };

  render() {
    const t = this.props.t;
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
        <div className="cb-header">{t("pods.pod.detail.podStatus.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={this.state.columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "last_update", direction: "desc" },
                    ]}
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

class PhysicalResources extends Component {
  render() {
    const t = this.props.t;
    const network_title = ["in", "out"];
    return (
      <div className="content-box line-chart">
        <div className="cb-header">
          {t("pods.pod.detail.physicalResources.title")}
        </div>
        <div className="cb-body">
          <div className="cb-body-content">
            <LineReChart
              rowData={this.props.rowData.cpu}
              unit="m"
              name="cpu"
              title="CPU"
              cardinal={false}
            ></LineReChart>
          </div>
          <div className="cb-body-content">
            <LineReChart
              rowData={this.props.rowData.memory}
              unit="mib"
              name="memory"
              title="Memory"
              cardinal={false}
            ></LineReChart>
          </div>
          <div className="cb-body-content">
            <LineReChart
              rowData={this.props.rowData.network}
              unit="Bps"
              name={network_title}
              title="Network"
              cardinal={true}
            ></LineReChart>
          </div>
        </div>
      </div>
    );
  }
}

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "project", title: "Project" },
        { name: "type", title: "Type" },
        { name: "reason", title: "Reason" },
        { name: "object", title: "Object" },
        { name: "message", title: "Message" },
        { name: "time", title: "Time" },
      ],
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

  componentWillMount() {
    // this.props.onSelectMenu(false, "");
  }

  // callApi = async () => {
  //   const response = await fetch("/clusters");
  //   const body = await response.json();
  //   return body;
  // };

  // progress = () => {
  //   const { completed } = this.state;
  //   this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  // };

  // //컴포넌트가 모두 마운트가 되었을때 실행된다.
  // componentDidMount() {
  //   //데이터가 들어오기 전까지 프로그래스바를 보여준다.
  //   this.timer = setInterval(this.progress, 20);
  //   this.callApi()
  //     .then((res) => {
  //       this.setState({ rows: res });
  //       clearInterval(this.timer);
  //     })
  //     .catch((err) => console.log(err));
  // };

  render() {
    const t = this.props.t;
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
        <div className="cb-header">{t("pods.pod.detail.events.title")}</div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={this.state.columns}>
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

export default withTranslation()(PjPodDetail);

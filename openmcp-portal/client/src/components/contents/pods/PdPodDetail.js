import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext } from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";
// import LineChart from './../../modules/LineChart';
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from "@devexpress/dx-react-grid";
import LineReChart from "./../../modules/LineReChart";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
// import PdPodResourceConfig from './../modal/PdPodResourceConfig';
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";

// import PlayArrowIcon from '@material-ui/icons/PlayArrow';
// import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
// import PauseIcon from '@material-ui/icons/Pause';
// import PauseRoundedIcon from '@material-ui/icons/PauseRounded';

// import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import { withTranslation } from "react-i18next";

// let apiParams = "";
class PdPodDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      completed: 0,
      reRender: "",
    };
  }

  componentWillMount() {
    // this.props.menuData("none");
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
        utilLog.fn_insertPLogs(userId, "log-PD-VW04");
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    var param = this.props.match.params;
    const response = await fetch(
      `/pods/${param.pod}${this.props.location.search}`
    );
    // const response = await fetch(
    //   `/projects/${this.props.location.state.data.project}/resources/pods/${param.pod}${this.props.location.search}`
    // );
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
                <NavLink to="/clusters">{t("pods.title")}</NavLink>
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
                  parentsProps={this.props}
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
        <div className="cb-header" style={{ position: "relative" }}>
          <span>{t("pods.pod.detail.basicInfo.title")}</span>

          {/* <PdPodResourceConfig name={this.props.rowData.name}/> */}
        </div>
        <div className="cb-body">
          <div>
            <span>{t("pods.pod.detail.basicInfo.name")} : </span>
            <strong>{this.props.rowData.name}</strong>
          </div>
          <div style={{ display: "flex" }}>
            <div className="cb-body-left">
              <div>
                <span>{t("pods.pod.detail.basicInfo.status")} : </span>
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
                <span>{t("pods.pod.detail.basicInfo.cluster")} : </span>
                {this.props.rowData.cluster}
              </div>
              <div>
                <span>{t("pods.pod.detail.basicInfo.project")} : </span>
                {this.props.rowData.project}
              </div>
              <div>
                <span>{t("pods.pod.detail.basicInfo.node")} : </span>
                {this.props.rowData.node}
              </div>
              <div>
                <span>
                  {t("pods.pod.detail.basicInfo.totalRestartCount")} :{" "}
                </span>
                {this.props.rowData.total_restart_count}
              </div>
            </div>
            <div className="cb-body-right">
              <div>
                <span>{t("pods.pod.detail.basicInfo.namespace")} : </span>
                {this.props.rowData.namespace}
              </div>
              <div>
                <span>{t("pods.pod.detail.basicInfo.nodeIp")} : </span>
                {this.props.rowData.node_ip}
              </div>
              <div>
                <span>{t("pods.pod.detail.basicInfo.podIp")} : </span>
                {this.props.rowData.pod_ip}
              </div>
              <div>
                <span>{t("pods.pod.detail.basicInfo.createdTime")} : </span>
                {this.props.rowData.created_time}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class PodStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "type", width: 200 },
        { columnName: "status", width: 120 },
        { columnName: "last_update", width: 200 },
        { columnName: "reason", width: 200 },
        { columnName: "message", width: 400 },
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
    const columns = [
      { name: "type", title: t("pods.pod.detail.podStatus.grid.type") },
      { name: "status", title: t("pods.pod.detail.podStatus.grid.status") },
      {
        name: "last_update",
        title: t("pods.pod.detail.podStatus.grid.updatedTime"),
      },
      { name: "reason", title: t("pods.pod.detail.podStatus.grid.reason") },
      { name: "message", title: t("pods.pod.detail.podStatus.grid.message") },
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
        <div className="cb-header">{t("pods.pod.detail.podStatus.title")}</div>
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

class Containers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 250 },
        { columnName: "status", width: 130 },
        { columnName: "restart_count", width: 150 },
        { columnName: "port", width: 100 },
        { columnName: "image", width: 200 },
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
    const columns = [
      { name: "name", title: t("pods.pod.detail.containers.grid.name") },
      { name: "status", title: t("pods.pod.detail.containers.grid.status") },
      {
        name: "restart_count",
        title: t("pods.pod.detail.containers.grid.restartCount"),
      },
      { name: "port", title: t("pods.pod.detail.containers.grid.port") },
      { name: "image", title: t("pods.pod.detail.containers.grid.image") },
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
        <div className="cb-header">{t("pods.pod.detail.containers.title")}</div>
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

class PhysicalResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rowData: this.props.rowData,
      isPlay: false,
    };
  }
  componentDidMount() {}

  componentWillUnmount() {
    console.log("willUnmount");
    clearInterval(this.timer);
  }

  callApi = async () => {
    var param = this.props.parentsProps;
    const response = await fetch(
      `/pods/${param.match.params.pod}/physicalResPerMin${param.location.search}`
    );

    // this.props.parentsProps.location.search
    // this.props.parentsProps.match.params.pod

    const body = await response.json();
    return body;
  };

  onStart = () => {
    console.log("onStart");
    this.callApi()
      .then((res) => {
        console.log("res: ", res.network);
        this.setState({ rowData: res });
      })
      .catch((err) => console.log(err));
  };

  onPlay = (play) => {
    if (play) {
      this.setState({ isPlay: false });
      console.log("stop");
      clearInterval(this.timer);
    } else {
      this.setState({ isPlay: true });
      console.log("play");
      this.onStart();
      this.timer = setInterval(this.onStart, 5000);
    }

    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
  };
  render() {
    const t = this.props.t;
    const network_title = ["in", "out"];
    return (
      <div className="content-box line-chart">
        <div className="cb-header">
          {t("pods.pod.detail.physicalResources.title")}
          {this.state.isPlay ? (
            <PauseCircleFilledIcon
              style={{ position: "absolute", top: "-3px", marginLeft: "14px" }}
              onClick={() => this.onPlay(this.state.isPlay)}
            />
          ) : (
            <PlayCircleOutlineIcon
              style={{ position: "absolute", top: "-3px", marginLeft: "14px" }}
              onClick={() => this.onPlay(this.state.isPlay)}
            />
          )}
        </div>
        <div className="cb-body">
          <div className="cb-body-content">
            <LineReChart
              rowData={this.state.rowData.cpu}
              unit="m"
              name="cpu"
              title="CPU"
              cardinal={false}
            ></LineReChart>
          </div>
          <div className="cb-body-content">
            <LineReChart
              rowData={this.state.rowData.memory}
              unit="mib"
              name="memory"
              title="Memory"
              cardinal={false}
            ></LineReChart>
          </div>
          <div className="cb-body-content">
            <LineReChart
              rowData={this.state.rowData.network}
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
    const columns = [
      { name: "project", title: t("pods.pod.detail.events.grid.project") },
      { name: "type", title: t("pods.pod.detail.events.grid.type") },
      { name: "reason", title: t("pods.pod.detail.events.grid.reason") },
      { name: "object", title: t("pods.pod.detail.events.grid.object") },
      { name: "message", title: t("pods.pod.detail.events.grid.message") },
      { name: "time", title: t("pods.pod.detail.events.grid.createdTime") },
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
        <div className="cb-header">{t("pods.pod.detail.events.title")}</div>
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

export default withTranslation()(PdPodDetail);

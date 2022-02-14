import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import { Link } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
  SelectionState,
  IntegratedSelection,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
  TableSelection,
} from "@devexpress/dx-react-grid-material-ui";
// import Editor from "./../modules/Editor";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import Confirm from "./../../modules/Confirm";
// import ProgressTemp from './../../modules/ProgressTemp';
import PieReChartMini from "../../modules/PieReChartMini";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import LinearProgressBar from "../../modules/LinearProgressBar.js";
import axios from "axios";
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { withTranslation } from "react-i18next";

// function GoLogin() {
//   const history = useHistory();
//   const handleOnClick = useCallback(() => {
//     AsyncStorage.setItem("token", null);
//     AsyncStorage.setItem("userName", null);
//     AsyncStorage.setItem("roles", null);
//     AsyncStorage.setItem("projects", null);
//     history.push("/login");
//   }, [history]);

//   return (
//     <button type="button" onClick={handleOnClick}>
//       Go home
//     </button>
//   );
// }

class ClustersJoined extends Component {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = {
      columns: [
        { name: "name", title: t("clusters.joined.grid.name") },
        { name: "status", title: t("clusters.joined.grid.status") },
        { name: "region", title: t("clusters.joined.grid.region") },
        { name: "zone", title: t("clusters.joined.grid.zone") },
        { name: "nodes", title: t("clusters.joined.grid.nodes") },
        { name: "cpu", title: t("clusters.joined.grid.cpu") },
        { name: "ram", title: t("clusters.joined.grid.memory") },
        { name: "provider", title: t("clusters.joined.grid.provider") },
        // { name: "disk", title: "Disk" },
        // { name: "network", title: "Network" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 100 },
        { columnName: "status", width: 100 },
        { columnName: "region", width: 100 },
        { columnName: "zone", width: 80 },
        { columnName: "nodes", width: 100 },
        { columnName: "cpu", width: 150 },
        { columnName: "ram", width: 150 },
        { columnName: "provider", width: 150 },
        // { columnName: "disk", width: 150 },
        // { columnName: "network", width: 150 },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
      selection: [],
      selectedRow: "",

      confrimTarget: "false",
      openProgress: false,
      anchorEl: null,
    };
  }
  componentWillMount() {
    // this.props.menuData("none");
  }

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    let accessToken;
    AsyncStorage.getItem("token", (err, result) => {
      accessToken = result;
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };
    const response = await fetch("/clusters", requestOptions);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  //컴포넌트가 모두 마운트가 되었을때 실행된다.
  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);

    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          let resData = res;
          if (res.hasOwnProperty("error")) {
            if (res.error === "invalid_token") {
              // //1. refresh토큰의 만료여부를 판단
              // //2. 만료되었을경우 로그인페이지로 이동
              // //3. 만료되지 않았을 경우, refresh토큰을 이용해 accessToken재 발급

              let refreshToken = "";
              AsyncStorage.getItem("refreshToken", (err, result) => {
                refreshToken = result;
              });

              const config = {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Basic b3Blbm1jcC1jbGllbnQ6b3Blbm1jcC1zZWNyZXQ=`,
                },
              };

              const url = `/oauth/token`;
              const data = `grant_type=refresh_token&refresh_token=${refreshToken}`;

              axios
                .post(url, data, config)
                .then((res, err) => {
                  if (res.data.access_token !== "fail") {
                    AsyncStorage.setItem("token", res.data.access_token);
                    AsyncStorage.setItem(
                      "refreshToken",
                      res.data.refresh_token
                    );
                    this.onRefresh();
                  } else {
                    alert("인증이 만료되어 로그인페이지로 이동합니다.");
                    AsyncStorage.setItem("token", null);
                    AsyncStorage.setItem("userName", null);
                    AsyncStorage.setItem("roles", null);
                    AsyncStorage.setItem("projects", null);
                    this.props.propsData.info.history.push("/login");
                  }
                })
                .catch((err) => {
                  AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
                });
            } else {
              alert("인증이 만료되어 로그인페이지로 이동합니다.");
              AsyncStorage.setItem("token", null);
              AsyncStorage.setItem("userName", null);
              AsyncStorage.setItem("roles", null);
              AsyncStorage.setItem("projects", null);
              this.props.propsData.info.history.push("/login");
            }
          } else {
            this.setState({ rows: resData });
          }
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CL-VW01");
      })
      .catch((err) => console.log(err));

  }

  confirmed = (result) => {
    if (result) {
      const url = `/cluster/unjoin`;
      const data = {
        clusterName: this.state.selectedRow.name,
      };

      axios
        .post(url, data)
        .then((res) => {
          // alert(res.data.message);
          this.setState({ open: false });
          this.onRefresh();
        })
        .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
        });

      let userId = null;
      AsyncStorage.getItem("userName", (err, result) => {
        userId = result;
      });
      utilLog.fn_insertPLogs(userId, "log-CL-EX02");
    } else {
      console.log("cancel");
    }
  };

  onRefresh = () => {
    // this.timer = setInterval(this.progress2, 20);
    // clearInterval(this.timer);

    if (this.state.openProgress) {
      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: true });
    }

    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
      })
      .catch((err) => console.log(err));
  };

  closeProgress = () => {
    this.setState({ openProgress: false });
  };

  render() {
    const { t } = this.props;
    const columns = [
      { name: "name", title: t("clusters.joined.grid.name") },
      { name: "status", title: t("clusters.joined.grid.status") },
      { name: "region", title: t("clusters.joined.grid.region") },
      { name: "zone", title: t("clusters.joined.grid.zone") },
      { name: "nodes", title: t("clusters.joined.grid.nodes") },
      { name: "cpu", title: t("clusters.joined.grid.cpu") },
      { name: "ram", title: t("clusters.joined.grid.memory") },
      { name: "provider", title: t("clusters.joined.grid.provider") },
      // { name: "disk", title: "Disk" },
      // { name: "network", title: "Network" },
    ];

    const confirmInfo = {
      title: t("clusters.joined.pop-unjoin.title"),
      context: t("clusters.joined.pop-unjoin.context"),
      button: {
        open: t("clusters.joined.btn-unjoin"),
        yes: t("common.btn.confirm"),
        no: t("common.btn.cancel"),
      },
    };

    // 셀 데이터 스타일 변경
    const HighlightedCell = ({ value, style, row, ...restProps }) => {
      var cpuPct =
        (parseFloat(row.cpu.split("/")[0]) /
          parseFloat(row.cpu.split("/")[1].split(" Core")[0])) *
        100;
      var memPct =
        (parseFloat(row.ram.split("/")[0]) /
          parseFloat(row.ram.split("/")[1].split(" Gi")[0])) *
        100;
      // console.log(cpuPct, memPct)
      var status = cpuPct >= 90 || memPct >= 90 ? "Warning" : value;
      return (
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
                status === "Healthy"
                  ? "#1ab726"
                  : status === "Unhealthy"
                  ? "red"
                  : status === "Unknown"
                  ? "#b5b5b5"
                  : status === "Warning"
                  ? "#ff8042"
                  : "black",
            }}
          >
            <FiberManualRecordSharpIcon
              style={{
                fontSize: 12,
                marginRight: 4,
                backgroundColor:
                  status === "Healthy"
                    ? "rgba(85,188,138,.1)"
                    : status === "Unhealthy"
                    ? "rgb(152 13 13 / 10%)"
                    : status === "Unknown"
                    ? "rgb(255 255 255 / 10%)"
                    : status === "Warning"
                    ? "rgb(109 31 7 / 10%)"
                    : "white",
                boxShadow:
                  status === "Healthy"
                    ? "0 0px 5px 0 rgb(85 188 138 / 36%)"
                    : status === "Unhealthy"
                    ? "rgb(188 85 85 / 36%) 0px 0px 5px 0px"
                    : status === "Unknown"
                    ? "rgb(255 255 255 / 10%)"
                    : status === "Warning"
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
                status === "Healthy"
                  ? "#1ab726"
                  : status === "Unhealthy"
                  ? "red"
                  : status === "Unknown"
                  ? "#b5b5b5"
                  : status === "Warning"
                  ? "#ff8042"
                  : "black",
            }}
          >
            {status}
          </span>
        </Table.Cell>
      );
    };

    //셀
    const Cell = (props) => {
      const { column, row } = props;

      const fn_linearProgressBar = () => {
        var data = [];
        if (props.value.indexOf(" ") > -1) {
          props.value.split(" ").forEach((item) => {
            if (item.indexOf("/") > -1) {
              item.split("/").map((i, index) => (data[index] = i));
            }
          });
        } else {
          data = [];
        }

        var percent = (data[0] / data[1]) * 100;

        return (
          <div>
            <p>{props.value + " (" + percent.toFixed(1) + "%)"}</p>
            <p style={{ marginTop: "5px" }}>
              <LinearProgressBar value={data[0]} total={data[1]} />
            </p>
          </div>
        );
      };

      // console.log("cell : ", props);
      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/clusters/${props.value}/overview`,
                state: {
                  data: row,
                },
              }}
            >
              {props.value}
            </Link>
          </Table.Cell>
        );
      } else if (column.name === "cpu" || column.name === "ram") {
        return (
          <Table.Cell>
            {/* <p>{props.value}</p> */}
            {fn_linearProgressBar()}
          </Table.Cell>
        );
        //
      }
      return <Table.Cell {...props} />;
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

    const onSelectionChange = (selection) => {
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({
        selectedRow: this.state.rows[selection[0]]
          ? this.state.rows[selection[0]]
          : {},
        confrimTarget: this.state.rows[selection[0]]
          ? this.state.rows[selection[0]].name
          : "false",
      });
    };

    const handleClick = (event) => {
      if (this.state.anchorEl === null) {
        this.setState({ anchorEl: event.currentTarget });
      } else {
        this.setState({ anchorEl: null });
      }
    };

    const handleClose = () => {
      this.setState({ anchorEl: false });
    };

    const open = Boolean(this.state.anchorEl);

    return [
      <div className="sub-content-wrapper cluster-list">
        {/* {this.state.openProgress ? <ProgressTemp openProgress={this.state.openProgress} closeProgress={this.closeProgress}/> : ""} */}
        {/* 컨텐츠 헤더 */}
        {/* <section className="content-header" onClick={this.onRefresh} >
          <h1>
            <i><FaBuffer/></i>
            <span>
              Joined Clusters
            </span>
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">Home</NavLink>
            </li>
            <li className="active">
              <NavigateNext
                style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
              />
              Clusters
            </li>
          </ol>
        </section> */}
        {this.state.rows ? (
          [
            // <GoLogin />,
            <section className="content" style={{ position: "relative" }}>
              <Paper>
                <div
                  style={{
                    position: "absolute",
                    right: "21px",
                    top: "20px",
                    zIndex: "10",
                    textTransform: "capitalize",
                  }}
                >
                  <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Popper
                    open={open}
                    anchorEl={this.state.anchorEl}
                    role={undefined}
                    transition
                    disablePortal
                    placement={"bottom-end"}
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin:
                            placement === "bottom"
                              ? "center top"
                              : "center top",
                        }}
                      >
                        <Paper>
                          <MenuList autoFocusItem={open} id="menu-list-grow">
                            <MenuItem
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <Confirm
                                confirmInfo={confirmInfo}
                                confrimTarget={this.state.confrimTarget}
                                confirmed={this.confirmed}
                                menuClose={handleClose}
                              />
                            </MenuItem>
                          </MenuList>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState className="search-Satste" defaultValue="" />
                  {/* <Confirm confirmInfo={this.state.confirmInfo} confrimTarget ={this.state.confrimTarget} confirmed={this.confirmed}/> */}
                  <SearchPanel
                    className="search-Satste"
                    style={{ marginLeft: 200, backgroundColor: "#000000" }}
                  />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "status", direction: "desc" },
                    ]}
                  />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  <SelectionState
                    selection={this.state.selection}
                    onSelectionChange={onSelectionChange}
                  />

                  <IntegratedFiltering />
                  <IntegratedSorting />
                  <IntegratedSelection />
                  <IntegratedPaging />

                  {/* 테이블 */}
                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                  <TableSelection selectByRowClick highlightRow />
                </Grid>
              </Paper>
            </section>,
            <section className="content" style={{ position: "relative" }}>
              <ResourceStatus data={this.state.rows} t={t} />
            </section>,
          ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "absolute", left: "50%", marginTop: "20px" }}
          ></CircularProgress>
        )}
      </div>,
    ];
  }
}

class ResourceStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
    };
  }

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

  componentWillUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        data: prevProps.data,
      });
    }
  }

  render() {
    const colors = ["#51BFFF", "#ecf0f5"];
    return (
      <div>
        <div className="rs-title">
          {this.props.t("clusters.joined.clusterResourceStatus")}
        </div>
        {/* <div className="rap-contents" style={{display: "flex",overflow: "auto"}}> */}
        <div className="rap-contents" style={{ overflow: "auto" }}>
          {this.state.data.map((item) => {
            return (
              <Paper className="rs-status">
                <div className="status-title">
                  <div>{item.name}</div>
                </div>

                <div class="status-content">
                  <PieReChartMini
                    name="CPU"
                    data={item.resourceUsage.cpu}
                    angle={this.angle.full}
                    unit={item.resourceUsage.cpu.unit}
                    colors={colors}
                  ></PieReChartMini>
                  <div class="sub-content">
                    <div>{item.resourceUsage.cpu.status[0].name}</div>
                    <div>
                      {item.resourceUsage.cpu.status[0].value.toFixed(1) +
                        " " +
                        item.resourceUsage.cpu.unit}
                    </div>
                  </div>
                  <div class="sub-content">
                    <div> {item.resourceUsage.cpu.status[1].name}</div>
                    <div>
                      {item.resourceUsage.cpu.status[1].value.toFixed(1) +
                        " " +
                        item.resourceUsage.cpu.unit}
                    </div>
                  </div>
                </div>

                <div class="status-content">
                  <PieReChartMini
                    name="Memory"
                    data={item.resourceUsage.memory}
                    angle={this.angle.full}
                    unit={item.resourceUsage.memory.unit}
                    colors={colors}
                  ></PieReChartMini>
                  <div class="sub-content">
                    <div>{item.resourceUsage.memory.status[0].name}</div>
                    <div>
                      {item.resourceUsage.memory.status[0].value.toFixed(1) +
                        " " +
                        item.resourceUsage.memory.unit}
                    </div>
                  </div>
                  <div class="sub-content">
                    <div> {item.resourceUsage.memory.status[1].name}</div>
                    <div>
                      {item.resourceUsage.memory.status[1].value.toFixed(1) +
                        " " +
                        item.resourceUsage.memory.unit}
                    </div>
                  </div>
                </div>

                <div class="status-content">
                  <PieReChartMini
                    name="Storage"
                    data={item.resourceUsage.storage}
                    angle={this.angle.full}
                    unit={item.resourceUsage.cpu.unit}
                    colors={colors}
                  ></PieReChartMini>
                  <div class="sub-content">
                    <div>{item.resourceUsage.storage.status[0].name}</div>
                    <div>
                      {item.resourceUsage.storage.status[0].value.toFixed(1) +
                        " " +
                        item.resourceUsage.storage.unit}
                    </div>
                  </div>
                  <div class="sub-content">
                    <div> {item.resourceUsage.storage.status[1].name}</div>
                    <div>
                      {item.resourceUsage.storage.status[1].value.toFixed(1) +
                        " " +
                        item.resourceUsage.storage.unit}
                    </div>
                  </div>
                </div>

                {/* <div className="status-title">
                <div>{item.name}</div>
              </div>
              <div className="status-content">
                <div style={{color:(item.status === "Warning" ? "#ff8042" : "#000000")}}>
                  <span>CPU: </span>
                  <span>{item.cpu}</span>
                </div>
                <div style={{color:(item.status === "Warning" ? "#ff8042" : "#000000")}}>
                  <span>Memory: </span>
                  <span>{item.ram}</span>
                </div>
                <div>
                  <span>Disk: </span>
                  <span>{item.disk}</span>
                </div>
                <div>
                  <span>Network: </span>
                  <span>{item.network}</span>
                </div>

              </div> */}
              </Paper>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withTranslation()(ClustersJoined);

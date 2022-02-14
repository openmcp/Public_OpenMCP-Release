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
  // FilteringState,
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
  // TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
// import {  Button,} from "@material-ui/core";
// import Editor from "./../../modules/Editor";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import PjDeploymentMigration from "./../modal/PjDeploymentMigration";
// import { NavigateNext } from "@material-ui/icons";
import axios from "axios";
import ProgressTemp from "./../../modules/ProgressTemp";
// import SnapShotControl from "./../modal/SnapShotControl";

import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
// import { AiOutlineDeploymentUnit } from "react-icons/ai";
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { withTranslation } from "react-i18next";
import CreateDeployment from "../modal/deployment/CreateDeployment";
import Confirm2 from "./../../modules/Confirm2";

// let apiParams = "";
class Deployments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 250 },
        { columnName: "status", width: 100 },
        { columnName: "cluster", width: 130 },
        { columnName: "project", width: 200 },
        { columnName: "image", width: 370 },
        { columnName: "created_time", width: 170 },
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
      //       editorContext: `apiVersion: apps/v1
      // kind: Deployment
      // metadata:
      //   name: [deployment name]
      //   labels:
      //     app: [deployment label]
      // spec:
      //   replicas: [replica number]
      //   selector:
      //     matchLabels:
      //       app: [matchLabels]
      //   template:
      //     metadata:
      //       labels:
      //         app: [labels]
      //     spec:
      //       containers:
      //       - name: [container name]
      //         image: [image name]
      //         ports:
      //         - containerPort: [container port]`,
      openProgress: false,
      anchorEl: null,
      projects: "",
      confirmOpen: false,

      confrimTarget: "",
      confirmTargetKeyname: "Deployment Name",
    };
  }

  componentWillMount() {
    var projects = "";

    AsyncStorage.getItem("projects", (err, result) => {
      projects = result;
    });

    this.setState({
      projects: projects,
    });
    // this.props.menuData("none");
  }

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        g_clusters: g_clusters,
        ynOmcpDp: false,
      }),
    };
    // var param = this.props.match.params.cluster;
    // queryString = queryString.parse(this.props.location.search).cluster
    // console.log(query);
    const response = await fetch(`/deployments`, requestOptions);
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
      .then((result) => {
        if (result === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: result });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-DP-VW01");

      })
      .catch((err) => console.log(err));
  }

  onUpdateData = () => {
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        this.setState({
          selection: [],
          selectedRow: "",
          rows: res,
        });
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  excuteScript = (cluster, context) => {
    if (this.state.openProgress) {
      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: true });
    }

    const url = `/deployments/create`;
    const data = {
      cluster: cluster,
      yaml: context,
    };

    axios
      .post(url, data)
      .then((res) => {
        // alert(res.data[0].text);
        this.handleClose();
        this.setState({ rows: "" });
        this.setState({ openProgress: false });
        this.onUpdateData();

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-DP-EX01");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
        this.setState({ openProgress: false });
      });
  };

  handleDeleteClick = (e) => {
    const { t } = this.props;
    if (Object.keys(this.state.selectedRow).length === 0) {
      alert(t("deployments.pop-delete.msg.chk-selectDeployment"));
      return;
    } else {
      this.setState({
        confirmOpen: true,
      });
    }
  };

  //delete deployment confirm
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    //show progress loading...
    this.setState({ openProgress: true });

    if (result) {
      const url = `/deployments/delete`;

      const data = {
        cluster: this.state.selectedRow.cluster,
        namespace: this.state.selectedRow.project,
        deployment: this.state.selectedRow.name,
        ynOmcpDp: false,
      };

      // console.log(data);
      axios
        .post(url, data)
        .then((res) => {
          // alert(res.data[0].text);
          this.handleClose();
          this.setState({ rows: "" });
          this.setState({ openProgress: false });
          this.onUpdateData();
        })
        .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
          this.setState({ openProgress: false });
        });

      // loging Add Node
      let userId = null;
      AsyncStorage.getItem("userName", (err, result) => {
        userId = result;
      });
      utilLog.fn_insertPLogs(userId, "log-DP-EX02");
    } else {
      this.setState({ openProgress: false });
    }
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  closeProgress = () => {
    this.setState({ openProgress: false });
  };

  //셀
  Cell = (props) => {
    const { column, row } = props;

    if (column.name === "name") {
      // // console.log("name", props.value);
      // console.log("this.props.match.params", this.props)
      return (
        <Table.Cell {...props} style={{ cursor: "pointer" }}>
          <Link
            to={{
              pathname: `/deployments/deployment/${props.value}`,
              search: `cluster=${row.cluster}&project=${row.project}`,
              state: {
                data: row,
              },
            }}
          >
            {props.value}
          </Link>
        </Table.Cell>
      );
    }
    return <Table.Cell>{props.value}</Table.Cell>;
  };

  HeaderRow = ({ row, ...restProps }) => (
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

  Row = (props) => {
    // if(this.state.projects.indexOf(props.tableRow.row.project) > -1){
    //   return <Table.Row {...props} key={props.tableRow.key} />;
    // } else {
    //   return null;
    // }

    return <Table.Row {...props} key={props.tableRow.key} />;
  };
  render() {
    const { t } = this.props;
    const confirmInfo = {
      title: t("deployments.pop-delete.title"),
      context: t("deployments.pop-delete.context"),
      button: {
        open: "",
        yes: t("common.btn.confirm"),
        no: t("common.btn.cancel"),
      },
    };
    const columns = [
      { name: "name", title: t("deployments.grid.name") },
      { name: "status", title: t("deployments.grid.ready") },
      { name: "cluster", title: t("deployments.grid.cluster") },
      { name: "project", title: t("deployments.grid.project") },
      { name: "image", title: t("deployments.grid.image") },
      { name: "created_time", title: t("deployments.grid.createdTime") },
    ];
    const onSelectionChange = (selection) => {
      // console.log(this.state.rows[selection[0]])
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({
        selectedRow: this.state.rows[selection[0]]
          ? this.state.rows[selection[0]]
          : {},
        confrimTarget: this.state.rows[selection[0]]
          ? this.state.rows[selection[0]].name
          : "",
      });
    };

    const handleClick = (event) => {
      if (this.state.anchorEl === null) {
        this.setState({ anchorEl: event.currentTarget });
      } else {
        this.setState({ anchorEl: null });
      }
    };

    const open = Boolean(this.state.anchorEl);

    return (
      <div className="sub-content-wrapper fulled">
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}
        <Confirm2
          confirmInfo={confirmInfo}
          confrimTarget={this.state.confrimTarget}
          confirmTargetKeyname={this.state.confirmTargetKeyname}
          confirmed={this.confirmed}
          confirmOpen={this.state.confirmOpen}
        />

        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
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
                              // onClick={this.handleClose}
                              onKeyDown={(e) => e.stopPropagation()}
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <CreateDeployment
                                btTitle={t("deployments.pop-create.btn-create")}
                                title={t("deployments.pop-create.title")}
                                excuteScript={this.excuteScript}
                                menuClose={this.handleClose}
                              />
                            </MenuItem>
                            <MenuItem
                              onKeyDown={(e) => e.stopPropagation()}
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <div onClick={this.handleDeleteClick}>
                                {t("deployments.pop-delete.btn-delete")}
                              </div>
                            </MenuItem>
                          </MenuList>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>,
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />

                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "created_time", direction: "desc" },
                    ]}
                  />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />

                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* <EditingState
                    onCommitChanges={commitChanges}
                  /> */}
                  <SelectionState
                    selection={this.state.selection}
                    onSelectionChange={onSelectionChange}
                  />
                  {/* <FilteringState/> */}

                  <IntegratedFiltering />
                  <IntegratedSorting />
                  <IntegratedSelection />
                  <IntegratedPaging />

                  {/* 테이블 */}
                  <Table cellComponent={this.Cell} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={this.HeaderRow}
                  />
                  <TableSelection
                    selectByRowClick
                    highlightRow
                    rowComponent={this.Row}
                    // showSelectionColumn={false}
                  />

                  {/* <TableFilterRow showFilterSelector={true}/> */}
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
        </section>
      </div>
    );
  }
}

export default withTranslation()(Deployments);

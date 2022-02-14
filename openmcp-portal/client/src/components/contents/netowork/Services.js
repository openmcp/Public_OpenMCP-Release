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
import Editor from "./../../modules/Editor";
// import { NavigateNext} from '@material-ui/icons';
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { withTranslation } from "react-i18next";
import Confirm from "../../modules/Confirm";
import ProgressTemp from "../../modules/ProgressTemp";

// let apiParams = "";
class Services extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 300 },
        { columnName: "cluster", width: 130 },
        { columnName: "project", width: 130 },
        { columnName: "type", width: 130 },
        { columnName: "cluster_ip", width: 130 },
        { columnName: "external_ip", width: 130 },
        { columnName: "selector", width: 330 },
        // { columnName: "port", width: 500 },
        { columnName: "created_time", width: 180 },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
      selection: [],
      selectedRow: "",
      confrimTarget: "false",
      openProgress: false,
      //       editorContext2 : `apiVersion: v1
      // kind: Service
      // metadata:
      //   namespace: openmcp
      //   labels: {}
      // spec:
      //   sessionAffinity: None
      //   selector: {}
      // `,
      editorContext: `apiVersion: openmcp.k8s.io/v1alpha1
kind: OpenMCPService
metadata:
  name: [service name]
  namespace: [namespace name]
spec:
  template:
    spec:
      type: [LoadBalancer]
      ports:
      - name: [http]
        port: [80]
  labelselector:
    app: [openmcp-nginx]
`,
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

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };
    // var param = this.props.match.params.cluster;
    const response = await fetch(`/services`, requestOptions);
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
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-NW-VW02");
      })
      .catch((err) => console.log(err));
  }

  onRefresh = () => {
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        this.setState({ openProgress: false });
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  //create service
  excuteScript = (context) => {
    if (this.state.openProgress) {
      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: true });
    }

    const url = `/apis/yamleapply`;
    const data = {
      yaml: context,
    };
    console.log(context);
    axios
      .post(url, data)
      .then((res) => {
        // alert(res.data.message);
        this.setState({ open: false });
        this.onRefresh();
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-NW-EX01");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {
          if (result === "true") alert(err);
        });
      });
  };

  //delete service
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    if (result) {
      //show progress loading...
      this.setState({ openProgress: true });

      const url = `/api/services/delete`;
      const data = {
        serviceData: this.state.selectedRow,
      };

      axios
        .delete(url, { data: data })
        .then((res) => {
          // alert(res.data.message);
          // console.log(res);
          // let res = {
          //   data: [
          //     {
          //       code: 200,
          //       result: "success",
          //       text: "Deployment delete completed",
          //     },
          //     {
          //       code: 200,
          //       result: "success",
          //       text: "Deployment delete completed",
          //     },
          //   ],
          // };
          this.setState({ open: false });
          this.onRefresh();
          let userId = null;
          AsyncStorage.getItem("userName", (err, result) => {
            userId = result;
          });
          utilLog.fn_insertPLogs(userId, "log-NW-EX03");
        })
        .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {
            if (result === "true") alert(err);
          });
          this.setState({ openProgress: false });
        });
    }
  };

  render() {
    const { t } = this.props;
    const columns = [
      { name: "name", title: t("network.services.grid.name") },
      { name: "cluster", title: t("network.services.grid.cluster") },
      { name: "project", title: t("network.services.grid.project") },
      { name: "type", title: t("network.services.grid.type") },
      { name: "cluster_ip", title: t("network.services.grid.clusterIp") },
      { name: "external_ip", title: t("network.services.grid.externalIp") },
      { name: "selector", title: t("network.services.grid.selector") },
      // { name: "port", title: "Port" },
      { name: "created_time", title: t("network.services.grid.createdTime") },
    ];

    const confirmInfo = {
      title: t("network.services.pop-delete.title"),
      context: t("network.services.pop-delete.context"),
      button: {
        open: t("network.services.pop-delete.btn-delete"),
        yes: t("common.btn.confirm"),
        no: t("common.btn.cancel"),
      },
    };

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
              value === "Warning"
                ? "orange"
                : value === "Unschedulable"
                ? "red"
                : value === "Stop"
                ? "red"
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
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/network/services/${props.value}`,
                search: `cluster=${row.cluster}`,
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

    const onSelectionChange = (selection) => {
      // if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });

      let selectedRows = [];
      let selectedTarget = [];
      selection.forEach((id) => {
        selectedRows.push(this.state.rows[id]);
        selectedTarget.push(this.state.rows[id].name + ", ");
      });
      this.setState({
        selectedRow: selectedRows,
        confrimTarget: selectedTarget,
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
      this.setState({ anchorEl: null });
    };

    const open = Boolean(this.state.anchorEl);

    return (
      <div className="sub-content-wrapper fulled">
        {/* 컨텐츠 헤더 */}
        {/* <section className="content-header">
          <h1>
            <span onClick={this.onRefresh} style={{cursor:"pointer"}}>
              Services
            </span>
            <small>{apiParams}</small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">Home</NavLink>
            </li>
            <li className="active">
              <NavigateNext style={{fontSize:12, margin: "-2px 2px", color: "#444"}}/>
              Netowork
            </li>
          </ol>
        </section> */}
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}
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
                              onKeyDown={(e) => e.stopPropagation()}
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <Editor
                                btTitle={t(
                                  "network.services.pop-create.btn-create"
                                )}
                                title={t("network.services.pop-create.title")}
                                context={this.state.editorContext}
                                excuteScript={this.excuteScript}
                                menuClose={handleClose}
                              />
                            </MenuItem>
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
                </div>,
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "created_time", direction: "desc" },
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

                  <SelectionState
                    selection={this.state.selection}
                    onSelectionChange={onSelectionChange}
                  />

                  {/* 테이블 */}
                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                  <IntegratedSelection />
                  <TableSelection selectByRowClick highlightRow />
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

export default withTranslation()(Services);

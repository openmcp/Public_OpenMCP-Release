import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
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
  RowDetailState,
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
  TableRowDetail,
  TableColumnVisibility,
} from "@devexpress/dx-react-grid-material-ui";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import IconButton from "@material-ui/core/IconButton";
// import MenuItem from "@material-ui/core/MenuItem";
// import MoreVertIcon from "@material-ui/icons/MoreVert";
// import Popper from "@material-ui/core/Popper";
// import MenuList from "@material-ui/core/MenuList";
// import Grow from "@material-ui/core/Grow";
// import ExcuteMigration from "../../modal/ExcuteMigration";
// import { Button } from "@material-ui/core";
import ExcuteSnapshot from "../../modal/ExcuteSnapshot.js";
// import LinearProgressBar from "../../../modules/LinearProgressBar.js";
import LinearProgressBar2 from "../../../modules/LinearProgressBar2.js";
import Confirm2 from "../../../modules/Confirm2.js";
import axios from "axios";
import { dateFormat } from "../../../util/Utility.js";
import { withTranslation } from "react-i18next";

class Snapshot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "deployment", title: "Deployment" },
        { name: "snapshots", title: "Snapshots" },
        { name: "cluster", title: "Cluster" },
        { name: "project", title: "Project" },
        { name: "sub_info", title: "sub" },
      ],
      defaultColumnWidths: [
        { columnName: "deployment", width: 250 },
        { columnName: "snapshots", width: 130 },
        { columnName: "cluster", width: 200 },
        { columnName: "project", width: 200 },
        { columnName: "sub_info", width: 1 },
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

      openProgress: false,
      projects: "",
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

    const response = await fetch(`/apis/snapshot/list`, requestOptions);
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
        this.setState({ rows: result });
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-SS-VW01");
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

  onRefresh = () => {
    if (this.state.openProgress) {
      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: true });
    }
    this.callApi()
      .then((res) => {
        this.setState({
          // selection : [],
          // selectedRow : "",
          rows: res,
        });
      })
      .catch((err) => console.log(err));
  };

  closeProgress = () => {
    this.setState({ openProgress: false });
  };

  //셀
  Cell = (props) => {
    return <Table.Cell>{props.value}</Table.Cell>;
  };

  HeaderRow = ({ row, ...restProps }) => (
    <Table.Row
      {...restProps}
      style={{
        cursor: "pointer",
        backgroundColor: "whitesmoke",
      }}
    />
  );

  Row = (props) => {
    return <Table.Row {...props} key={props.tableRow.key} />;
  };

  onExpandedRowIdsChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);
    return this.setState({ expandedRowIds: selection });
  };

  RowDetail = ({ row }) => (
    <div>
      <SnapshotDetail
        deployment={row.deployment}
        namespace={row.project}
        row={row.sub_info}
        onSelectionChange={this.onSelectionChange}
        onUpdateData={this.onUpdateData}
      />
    </div>
  );

  render() {
    const { t } = this.props;
    const onSelectionChange = (selection) => {
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      let selectedRows = [];
      selection.forEach((index) => {
        selectedRows.push(this.state.rows[index]);
      });
      this.setState({
        selectedRow: selectedRows.length > 0 ? selectedRows : {},
      });
    };

    return (
      <div className="sub-content-wrapper">
        {/* 컨텐츠 헤더 */}
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                <div
                  style={{
                    position: "absolute",
                    right: "30px",
                    top: "27px",
                    zIndex: "10",
                    textTransform: "capitalize",
                  }}
                >
                  <ExcuteSnapshot
                    title={t("snapshots.snapshot.pop-snapshot.title")}
                    rowData={this.state.selectedRow}
                    onUpdateData={this.onUpdateData}
                  />
                </div>,
                <Grid rows={this.state.rows} columns={this.state.columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />

                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "snapshots", direction: "desc" },
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
                  <RowDetailState
                    // defaultExpandedRowIds={[2, 5]}
                    expandedRowIds={this.state.expandedRowIds}
                    onExpandedRowIdsChange={this.onExpandedRowIdsChange}
                  />

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

                  <TableColumnVisibility
                    defaultHiddenColumnNames={["sub_info"]}
                  />
                  <TableRowDetail contentComponent={this.RowDetail} />

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

class SnapshotDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      columns: [
        { name: "snapshot", title: "Snapshot" },
        { name: "status", title: "Status" },
        { name: "creationTime", title: "Creation Time" },
        { name: "increment", title: "Increment" },
        { name: "control", title: "Restore" },
      ],
      tableColumnExtensions: [
        { columnName: "snapshot", width: "30%" },
        { columnName: "status", width: "150px" },
        { columnName: "creationTime", width: "200px" },
        { columnName: "increment", width: "150px" },
        { columnName: "control", width: "100px", align: "center" },
      ],
      value: 0,
      confirmOpen: false,
      confirmInfo: {
        title: "confirmTitle",
        context: "confirmText",
        button: {
          open: "",
          yes: "OK",
          no: "CANCEL",
        },
      },
      confrimTarget: "false",
      confirmTargetKeyname: "snapshot",
      selectedRow: [],
    };
  }

  componentDidMount() {
    let result = [];
    if (this.props.row !== null) {
      this.props.row.map((item) => result.push(item));
      this.setState({ rows: result });
    }
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRow: "",
    });
  };

  HeaderRow = ({ row, ...restProps }) => (
    <Table.Row
      {...restProps}
      style={{
        cursor: "pointer",
        backgroundColor: "#f5f5f5",
      }}
    />
  );

  confirmed = (result) => {
    if (result) {
      // Restore Snapshot

      // apiVersion: openmcp.k8s.io/v1alpha1
      // kind: SnapshotRestore
      // metadata:
      //   name: example-snapshotrestore-group
      // spec:
      //   groupSnapshotKey: "1636967136"
      //   isGroupSnapshot: true

      const url = `/apis/snapshot/restore`;
      const data = {
        cluster: "openmcp",
        namespace: this.props.namespace,
        deployment: this.props.deployment,
        snapshot: this.state.selectedRow.snapshot,
        restoreName: `restore-${this.state.selectedRow.snapshot}-${dateFormat(
          new Date(),
          "%Y%m%d%H%M%S",
          false
        )}`,
      };
      axios
        .post(url, data)
        .then((res) => {
          // alert(res.data[0].text);
          this.setState({ open: false });
          this.props.onUpdateData();
        })
        .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
        });

      let userId = null;
      AsyncStorage.getItem("userName", (err, result) => {
        userId = result;
      });
      utilLog.fn_insertPLogs(userId, "log-SS-EX02");
    } else {
      console.log("cancel");
    }
    this.setState({ confirmOpen: false, open: false });
  };

  onSnapshotRestore = (data) => {
    this.setState({
      confirmOpen: true,
      confirmInfo: {
        title: "Snapshot Restore",
        context: "Are you sure you want to Restore?",
        button: {
          open: "",
          yes: "Restore",
          no: "Cancel",
        },
      },
      confrimTarget: data,
      confirmTargetKeyname: "snapshot",
    });
  };

  render() {
    const Cell = (props) => {
      const { column, row } = props;
      if (column.name === "increment") {
        let mBtye = (props.value / Math.pow(1024, 2)).toFixed(2);
        return (
          <Table.Cell
            {...props}
            style={{
              padding: "0px",
            }}
          >
            <div className="progressbar" style={{ display: "float" }}>
              <LinearProgressBar2
                value={mBtye}
                total={10}
                mColor={"normalColor"}
                bColor={"normalBaseColor"}
              />
              {mBtye} MB
            </div>
          </Table.Cell>
        );
      } else if (column.name === "control") {
        return (
          <Table.Cell
            {...props}
            style={{
              borderRight: "1px solid #e0e0e0",
              borderLeft: "1px solid #e0e0e0",
              textAlign: "center",
              background: "whitesmoke",
            }}
          >
            <div className="snapshot">
              <span
                className="revert"
                style={{ cursor: "pointer", display: "inline-block" }}
                onClick={() => {
                  this.setState({ selectedRow: row });
                  this.onSnapshotRestore(row.snapshot);
                }}
              >
                Restore
              </span>
            </div>
          </Table.Cell>
        );
      } else {
        return <Table.Cell>{props.value}</Table.Cell>;
      }
    };
    return (
      <div className="inner-table">
        {this.state.rows ? (
          <Paper>
            <Confirm2
              confirmInfo={this.state.confirmInfo}
              confrimTarget={this.state.confrimTarget}
              confirmTargetKeyname={this.state.confirmTargetKeyname}
              confirmed={this.confirmed}
              confirmOpen={this.state.confirmOpen}
            />

            <Grid rows={this.state.rows} columns={this.state.columns}>
              {/* Sorting */}
              <SortingState
                defaultSorting={[
                  { columnName: "creationTime", direction: "asc" },
                ]}
              />

              <IntegratedFiltering />
              <IntegratedSorting />

              {/* 테이블 */}
              <Table
                cellComponent={Cell}
                columnExtensions={this.state.tableColumnExtensions}
              />
              {/* <TableColumnResizing
              defaultColumnWidths={this.state.defaultColumnWidths}
            /> */}
              <TableHeaderRow
                showSortingControls
                rowComponent={this.HeaderRow}
              />
            </Grid>
          </Paper>
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

export default withTranslation()(Snapshot);

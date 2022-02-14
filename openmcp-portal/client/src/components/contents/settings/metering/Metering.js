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
// import ExcuteSnapshot from "../../modal/ExcuteSnapshot.js";
// import LinearProgressBar from "../../../modules/LinearProgressBar.js";
// import LinearProgressBar2 from "../../../modules/LinearProgressBar2.js";
// import Confirm2 from "../../../modules/Confirm2.js";
// import axios from "axios";
// import { dateFormat } from "../../../util/Utility.js";
import { AiOutlineAreaChart } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import { NavigateNext } from "@material-ui/icons";
import MtAddRegionCost from "../../modal/metering/MtAddRegionCost.js";
import MtEditMetering from "../../modal/metering/MtEditMetering.js";
import { withTranslation } from 'react-i18next';

class Metering extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "region", title: "Region" },
        { name: "region_name", title: "Region Name" },
        { name: "cost", title: "Cluster Cost" },
        { name: "created_time", title: "Created Time" },
        { name: "workers", title: "workers" },
      ],
      defaultColumnWidths: [
        { columnName: "region", width: 100 },
        { columnName: "region_name", width: 160 },
        { columnName: "cost", width: 150 },
        { columnName: "created_time", width: 200 },
        { columnName: "workers", width: 1 },
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
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(`/apis/metering`);
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
        console.log(result)
        this.setState({ rows: result });
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-MR-VW01");
  }

  onUpdateData = () => {
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        this.setState({
          selection: [],
          selectedRow: "",
          rows: res,
          expandedRowIds: [],
        });
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));

  };

  closeProgress = () => {
    this.setState({ openProgress: false });
  };

  //셀
  Cell = (props) => {
    const { column } = props;
    if (props.value !== null && column.name === "cost"){
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {'$ '+props.value + '/hour'}
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
      <MeteringWorker
        // deployment={row.deployment}
        // namespace={row.project}
        row={row.workers}
        onSelectionChange={this.onSelectionChange}
        onUpdateData={this.onUpdateData}
      />
    </div>
  );

  render() {
    const {t} = this.props;
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
      <div className="content-wrapper fulled">
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
            <i>
              <AiOutlineAreaChart />
            </i>
            <span>{t("meterings.title")}</span>
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
            </li>
            <li className="active">
              <NavigateNext
                style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
              />
              {t("meterings.title")}
            </li>
          </ol>
        </section>
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
                  <MtAddRegionCost onUpdateData={this.onUpdateData}/>

                  <MtEditMetering selectedRow={this.state.selectedRow} onUpdateData={this.onUpdateData}/>

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
                    defaultHiddenColumnNames={["workers"]}
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

class MeteringWorker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      columns: [
        { name: "id", title: "ID" },
        { name: "cpu", title: "vCPU" },
        { name: "memory", title: "Memory" },
        { name: "disk", title: "Disk" },
        { name: "cost", title: "Worker Node Cost" },
        { name: "created_time", title: "Created time" },
        { name: "updated_time", title: "Updated Time" },
      ],
      tableColumnExtensions: [
        { columnName: "id", width: "50px" },
        { columnName: "cpu", width: "80px" },
        { columnName: "memory", width: "100px" },
        { columnName: "disk", width: "80px" },
        { columnName: "cost", width: "200px"},
        { columnName: "created_time", width: "200px"},
        { columnName: "updated_time", width: "200px"},
        
      ],
      value: 0,
      // confirmOpen: false,
      // confirmInfo: {
      //   title: "confirmTitle",
      //   context: "confirmText",
      //   button: {
      //     open: "",
      //     yes: "OK",
      //     no: "CANCEL",
      //   },
      // },
      // confrimTarget: "false",
      // confirmTargetKeyname: "snapshot",
      selectedRow: [],
    };
  }

  componentWillMount() {
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

  
  Cell = (props) => {
    const { column } = props;

    // const fn_linearProgressBar = () => {
    //   var data = [];
    //   if (props.value.indexOf(" ") > -1) {
    //     props.value.split(" ").forEach((item) => {
    //       if (item.indexOf("/") > -1) {
    //         item.split("/").map((i, index) => (data[index] = i));
    //       }
    //     });
    //   } else {
    //     data = [];
    //   }

    //   var percent = (data[0] / data[1]) * 100;

    //   return (
    //     <div>
    //       <p>{props.value + " (" + percent.toFixed(1) + "%)"}</p>
    //       <p style={{ marginTop: "5px" }}>
    //         <LinearProgressBar value={data[0]} total={data[1]} />
    //       </p>
    //     </div>
    //   );
    // };

    // console.log("cell : ", props);
    if (column.name === "cpu" || column.name === "memory" || column.name === "disk") {
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {props.value}
        </Table.Cell>
      );
    } else if (props.value !== null && column.name === "cost"){
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {'$ '+props.value + '/hour'}
        </Table.Cell>
      );
    }
    return <Table.Cell {...props} />;
  };


  render() {

    return (
      <div className="inner-table">
        {this.state.rows ? (
          <Paper>
            <Grid rows={this.state.rows} columns={this.state.columns}>
              {/* Sorting */}
              <SortingState
                defaultSorting={[
                  { columnName: "created_time", direction: "asc" },
                ]}
              />

              <IntegratedFiltering />
              <IntegratedSorting />

              {/* 테이블 */}
              <Table
                cellComponent={this.Cell}
                columnExtensions={this.state.tableColumnExtensions}
              />
              {/* <TableColumnResizing
              defaultColumnWidths={this.state.defaultColumnWidths}
            /> */}
              <TableHeaderRow
                showSortingControls
                rowComponent={this.HeaderRow}
              />
              <TableColumnVisibility
                    defaultHiddenColumnNames={["id"]}
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

export default withTranslation()(Metering); 
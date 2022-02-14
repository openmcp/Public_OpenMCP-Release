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
  // IntegratedSelection,
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
  TableRowDetail,
  TableColumnVisibility,
} from "@devexpress/dx-react-grid-material-ui";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import LinearProgressBar from "../../../modules/LinearProgressBar.js";
import { NavLink } from "react-router-dom";
import { NavigateNext } from "@material-ui/icons";
import { BiDollarCircle } from "react-icons/bi";
import { withTranslation } from 'react-i18next';

class BillList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "year", title: "Year" },
        { name: "month", title: "Month" },
        { name: "cost", title: "Total Cost" },
      ],
      defaultColumnWidths: [
        { columnName: "year", width: 100 },
        { columnName: "month", width: 100 },
        { columnName: "cost", width: 130 },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],
      completed: 0,
      openProgress: false,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(`/apis/billing`);
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
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-BL-VW01");
      })
      .catch((err) => console.log(err));

  }

  onUpdateData = () => {
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        this.setState({
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
    if (column.name === "year" || column.name === "month" ) {
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {props.value}
        </Table.Cell>
      );
    } else if (props.value !== null && column.name === "cost"){
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {'$ '+props.value}
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
      <BillingSubData
        row={row.details}
        onUpdateData={this.onUpdateData}
      />
    </div>
  );

  render() {
    const {t} = this.props;
    return (
      <div className="content-wrapper fulled">
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
          <i><BiDollarCircle/></i>
          <span>{t("billing.title")}</span>
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
            </li>
            <li className="active">
              <NavigateNext style={{fontSize:12, margin: "-2px 2px", color: "#444"}}/>
              {t("billing.title")}
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

                 
                  <IntegratedFiltering />
                  <IntegratedSorting />
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

class BillingSubData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      columns: [
        { name: "region", title: "Region" },
        { name: "clusters", title: "Clusters" },
        { name: "worker_spec", title: "Worker Nodes Spec" },
        { name: "workers", title: "Worker Nodes" },
        { name: "hours", title: "Hours" },
        { name: "cost", title: "Cost" },
      ],
      tableColumnExtensions: [
        { columnName: "region", width: "80px" },
        { columnName: "clusters", width: "80px" },
        { columnName: "worker_spec", width: "200px" },
        { columnName: "workers", width: "130px" },
        { columnName: "hours", width: "80px" },
        { columnName: "cost", width: "80px"},
        
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

  componentWillMount() {
    let result = [];
    if (this.props.row !== null) {
      this.props.row.map((item) => result.push(item));
      this.setState({ rows: result });
    }
  }

  initState = () => {
    this.setState({
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
    if (column.name === "region" || column.name === "clusters" || column.name === "worker_spec" || column.name === "workers" || column.name === "hours" ){
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {props.value}
        </Table.Cell>
      );
    } else if (props.value !== null && column.name === "cost"){
      return (
        <Table.Cell {...props} style={{textAlign:"center"}}>
         {'$ '+props.value}
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

export default withTranslation()(BillList); 
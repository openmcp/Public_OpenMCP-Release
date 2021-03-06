import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import { NavLink, Link } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
// import Editor from "./../../../modules/Editor";
import { NavigateNext } from "@material-ui/icons";
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import { withTranslation } from "react-i18next";
import { Button } from "@material-ui/core";

let apiParams = "";
class PjPods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
        { name: "status", title: "Status" },
        { name: "cluster", title: "Cluster" },
        { name: "project", title: "Project" },
        { name: "pod_ip", title: "Pod IP" },
        { name: "node", title: "Node" },
        { name: "node_ip", title: "Node IP" },
        // { name: "cpu", title: "CPU" },
        // { name: "memory", title: "Memory" },
        { name: "created_time", title: "Created Time" },
      ],
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
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
      editorContext: ``,
    };
  }

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
    apiParams = this.props.match.params.project;
  }

  callApi = async () => {
    // var param = this.props.match.params.cluster;
    const response = await fetch(
      `/projects/${apiParams}/resources/pods${this.props.location.search}`
    );
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  onRefresh = () => {
    this.setState({ rows: "" });
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
        utilLog.fn_insertPLogs(userId, "log-PJ-VW05");
      })
      .catch((err) => console.log(err));
  };

  //??????????????? ?????? ???????????? ???????????? ????????????.
  componentDidMount() {
    this.onRefresh();
  }

  render() {
    const { t } = this.props;
    // ??? ????????? ????????? ??????
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

    //???
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
                pathname: `/projects/${apiParams}/resources/pods/${props.value}`,
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
      <div className="content-wrapper cluster-nodes">
        {/* ????????? ?????? */}
        <section className="content-header">
          <h1>
            {apiParams}
            <small>
              <NavigateNext className="detail-navigate-next" />
              {t("projects.detail.resources.pods.title")}
            </small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
            </li>
            <li className="active">
              <NavigateNext
                style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
              />
              {t("projects.title")}
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
          </ol>
        </section>
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.onRefresh}
                  style={{
                    position: "absolute",
                    right: "22px",
                    top: "28px",
                    zIndex: "10",
                    width: "148px",
                    height: "31px",
                    textTransform: "capitalize",
                  }}
                >
                  {t("common.btn.refresh")}
                </Button>,
                // <Editor title="create" context={this.state.editorContext}/>,
                <Grid rows={this.state.rows} columns={this.state.columns}>
                  <Toolbar />
                  {/* ?????? */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "status", direction: "desc" },
                    ]}
                  />
                  <IntegratedSorting />

                  {/* ????????? */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* ????????? */}
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
        </section>
      </div>
    );
  }
}

export default withTranslation()(PjPods);

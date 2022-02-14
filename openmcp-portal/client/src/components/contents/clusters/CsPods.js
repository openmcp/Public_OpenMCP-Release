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
// import Editor from "../../modules/Editor";
import { NavigateNext } from "@material-ui/icons";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import { withTranslation } from "react-i18next";

let apiParams = "";
class CsPods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 370 },
        { columnName: "status", width: 100 },
        { columnName: "cluster", width: 100 },
        { columnName: "project", width: 110 },
        { columnName: "pod_ip", width: 100 },
        { columnName: "node", width: 180 },
        { columnName: "node_ip", width: 120 },
        // { columnName: "cpu", width: 80 },
        // { columnName: "memory", width: 80 },
        { columnName: "created_time", width: 160 },
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
      menu: "clusters",
      title: this.props.match.params.cluster,
      pathParams: {
        cluster: this.props.match.params.cluster,
      },
    };
    this.props.menuData(result);
    apiParams = this.props.match.params.cluster;
  }

  callApi = async () => {
    // var param = this.props.match.params.cluster;
    const response = await fetch(`/clusters/${apiParams}/pods`);
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
        utilLog.fn_insertPLogs(userId, "log-CL-VW05");
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { t } = this.props;
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
                pathname: `/clusters/${apiParams}/pods/${props.value}`,
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
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
            {apiParams}
            <small>
              <NavigateNext className="detail-navigate-next"/>
              {t("pods.title")}
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
              <NavLink to="/clusters">{t("clusters.title")}</NavLink>
            </li>
            <li className="active">
              <NavigateNext
                style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
              />
              {t("pods.title")}
            </li>
          </ol>
        </section>
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                // <Editor title="create" context={this.state.editorContext}/>,
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
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
        </section>
      </div>
    );
  }
}

export default withTranslation()(CsPods);

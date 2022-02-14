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
  TableHeaderRow,
  TableColumnResizing,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
// import Editor from "./../../modules/Editor";
import { NavigateNext } from "@material-ui/icons";
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import PjCreateProject from "./../../modal/PjCreateProject.js";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
// import IconButton from "@material-ui/core/IconButton";
// import MenuItem from "@material-ui/core/MenuItem";
// import MoreVertIcon from "@material-ui/icons/MoreVert";
// import Popper from "@material-ui/core/Popper";
// import MenuList from "@material-ui/core/MenuList";
// import Grow from "@material-ui/core/Grow";
// import { HiOutlineDuplicate } from "react-icons/hi";
import { MdCached } from "react-icons/md";
import { withTranslation } from "react-i18next";
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';

class GlobalCache extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historyColumns: [
        { name: "image_name", title: "Image Name" },
        { name: "image_count", title: "Image Count" },
        { name: "time", title: "Timestamp" },
      ],
      historyColumnWidths: [
        { columnName: "image_name", width: 350 },
        { columnName: "image_count", width: 100 },
        { columnName: "time", width: 160 },
      ],
      updateListColumns: [
        { name: "image_name", title: "Image Name" },
        { name: "image_status", title: "Image Status" },
        { name: "time", title: "Timestamp" },
      ],
      updateListColumnWidths: [
        { columnName: "image_name", width: 350 },
        { columnName: "image_status", width: 100 },
        { columnName: "time", width: 160 },
      ],

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
      anchorEl: null,
      gcHistory: "",
      gcUpdateList: "",
    };
  }

  componentWillMount() {
    this.props.menuData("none");
  }

  callApi = async () => {
    const response = await fetch("/apis/globalcache");
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
        if (res.hasOwnProperty("gc_history") && res["gc_history"] !== null) {
          this.setState({ gcHistory: res.gc_history });
        } else {
          this.setState({ gcHistory: []  });
        }

        if (res.hasOwnProperty("gc_update_list") && res["gc_update_list"] !== null) {
          this.setState({ gcUpdateList: res.gc_update_list });
        } else {
          this.setState({ gcUpdateList: [] });
        }
        
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-GC-VW01");
      })
      .catch((err) => console.log(err));
  }

  onRefresh = () => {
    this.callApi()
      .then((res) => {
        if (res.hasOwnProperty("gc_history") && res["gc_history"] !== null) {
          this.setState({ gcHistory: res.gc_history });
        } else {
          this.setState({ gcHistory: []  });
        }

        if (res.hasOwnProperty("gc_update_list") && res["gc_update_list"] !== null) {
          this.setState({ gcUpdateList: res.gc_update_list });
        } else {
          this.setState({ gcUpdateList: [] });
        }

        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { t } = this.props;

    // 셀 데이터 스타일 변경
    const HighlightedCell = ({ value, style, row, ...restProps }) => (
      <Table.Cell>
        <span
          style={{
            color:
              value === "Active"
                ? "#1ab726"
                : value === "Deactive"
                ? "red"
                : "black",
          }}
        >
          <FiberManualRecordSharpIcon
            style={{
              fontSize: 12,
              marginRight: 4,
              backgroundColor:
                value === "Active"
                  ? "rgba(85,188,138,.1)"
                  : value === "Deactive"
                  ? "rgb(152 13 13 / 10%)"
                  : "white",
              boxShadow:
                value === "Active"
                  ? "0 0px 5px 0 rgb(85 188 138 / 36%)"
                  : value === "Deactive"
                  ? "rgb(188 85 85 / 36%) 0px 0px 5px 0px"
                  : "white",
              borderRadius: "20px",
              // WebkitBoxShadow: "0 0px 1px 0 rgb(85 188 138 / 36%)",
            }}
          ></FiberManualRecordSharpIcon>
        </span>
        <span
          style={{
            color:
              value === "Active"
                ? "#1ab726"
                : value === "Deactive"
                ? "red"
                : undefined,
          }}
        >
          {value}
        </span>
      </Table.Cell>
    );

    const Cell = (props) => {
      const fnEnterCheck = (prop) => {
        var arr = [];
        var i;
        for (i = 0; i < Object.keys(prop.value).length; i++) {
          const str =
            Object.keys(prop.value)[i] + " : " + Object.values(prop.value)[i];
          arr.push(str);
        }
        return arr.map((item) => {
          return <p>{item}</p>;
        });
        // return (
        // props.value.indexOf("|") > 0 ?
        //   props.value.split("|").map( item => {
        //     return (
        //       <p>{item}</p>
        //   )}) :
        //     props.value
        // )
      };

      const { column, row } = props;
      // console.log("cell : ", props);
      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/projects/${props.value}/overview`,
                search: "cluster=" + row.cluster,
                state: {
                  data: row,
                },
              }}
            >
              {props.value}
            </Link>
          </Table.Cell>
        );
      } else if (column.name === "labels") {
        return <Table.Cell>{fnEnterCheck(props)}</Table.Cell>;
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

    return (
      <div className="content-wrapper fulled">
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
            <i>
              <MdCached />
            </i>
            <span onClick={this.onRefresh} style={{ cursor: "pointer" }}>
              {t("globalCache.title")}
            </span>
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
              {t("globalCache.title")}
            </li>
          </ol>
        </section>
        <section className="content" style={{ position: "relative" }}>
          <div className="gc-content">
            <div className="gc-sub-title">
              <span>{t("globalCache.sub.history")}</span>
            </div>
            {this.state.gcHistory ? (
              <Paper>
                <Grid
                  rows={this.state.gcHistory}
                  columns={this.state.historyColumns}
                >
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

                  {/* 테이블 */}
                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.historyColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>
              </Paper>
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{
                  display: "block",
                  margin: "30px auto 20px auto",
                }}
              ></CircularProgress>
            )}
          </div>
          <div className="gc-content">
            <div className="gc-sub-title">
              <span>{t("globalCache.sub.updateList")}</span>
            </div>
            {this.state.gcUpdateList ? (
              <Paper>
                <Grid
                  rows={this.state.gcUpdateList}
                  columns={this.state.updateListColumns}
                >
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

                  {/* 테이블 */}
                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.updateListColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>
              </Paper>
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{
                  display: "block",
                  margin: "30px auto 20px auto",
                }}
              ></CircularProgress>
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default withTranslation()(GlobalCache);

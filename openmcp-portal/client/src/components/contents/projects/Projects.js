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
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import PjCreateProject from "../modal/PjCreateProject.js";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import { HiOutlineDuplicate } from "react-icons/hi";
import { withTranslation } from "react-i18next";
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';

class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 200 },
        { columnName: "status", width: 100 },
        { columnName: "cluster", width: 100 },
        { columnName: "labels", width: 180 },
        { columnName: "created_time", width: 180 },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
      anchorEl: null,
    };
  }

  componentWillMount() {
    this.props.menuData("none");
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

    const response = await fetch("/projects", requestOptions);
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
        utilLog.fn_insertPLogs(userId, "log-PJ-VW01");
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
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { t } = this.props;
    const columns = [
      { name: "name", title: t("projects.grid.name") },
      { name: "status", title: t("projects.grid.status") },
      { name: "cluster", title: t("projects.grid.cluster") },
      { name: "labels", title: t("projects.grid.labels") },
      { name: "created_time", title: t("projects.grid.createdTime") },
    ];

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
      <div className="content-wrapper fulled">
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
            <i>
              <HiOutlineDuplicate />
            </i>
            <span onClick={this.onRefresh} style={{ cursor: "pointer" }}>
              {t("projects.title")}
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
              {t("projects.title")}
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
                              <PjCreateProject
                                menuClose={handleClose}
                                onUpdateData={this.onRefresh}
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

export default withTranslation()(Projects);

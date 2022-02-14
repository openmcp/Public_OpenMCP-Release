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
  IntegratedSelection,
  SelectionState,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  TableSelection,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import AddMembers from "./AddMembers";
import AcChangeRole from "./../modal/AcChangeRole";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import { withTranslation } from "react-i18next";

class Accounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "user_id", title: "User ID" },
        { name: "role", title: "Roles" },
        { name: "last_login_time", title: "Last login time" },
        { name: "created_time", title: "Created time" },
      ],
      defaultColumnWidths: [
        { columnName: "user_id", width: 150 },
        { columnName: "role", width: 400 },
        { columnName: "last_login_time", width: 200 },
        { columnName: "created_time", width: 200 },
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
      anchorEl: null,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(`/settings/accounts`);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  componentDidMount() {
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
        utilLog.fn_insertPLogs(userId, "log-AC-VW01");
      })
      .catch((err) => console.log(err));
  }

  onUpdateData = () => {
    this.callApi()
      .then((res) => {
        this.setState({
          selection: [],
          selectedRow: "",
          rows: res,
        });
      })
      .catch((err) => console.log(err));
  };

  render() {
    // const { t } = this.props;
    const Cell = (props) => {
      const { column } = props;

      const arrayToString = () => {
        const stringData = props.value.reduce((result, item, index, arr) => {
          if (index + 1 === arr.length) {
            return `${result}${item}`;
          } else {
            return `${result}${item}, `;
          }
        }, "");

        return stringData;
      };

      if (column.name === "role_name") {
        return <Table.Cell {...props}>{arrayToString()}</Table.Cell>;
      }
      return <Table.Cell>{props.value}</Table.Cell>;
    };

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
        }}
      />
    );
    const Row = (props) => {
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    const onSelectionChange = (selection) => {
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({
        selectedRow: this.state.rows[selection[0]]
          ? this.state.rows[selection[0]]
          : {},
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
                              <AddMembers
                                onUpdateData={this.onUpdateData}
                                menuClose={handleClose}
                                onRefresh={this.onRefresh}
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
                              <AcChangeRole
                                rowData={this.state.selectedRow}
                                onUpdateData={this.onUpdateData}
                                menuClose={handleClose}
                              />
                            </MenuItem>
                          </MenuList>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>,
                <Grid rows={this.state.rows} columns={this.state.columns}>
                  <Toolbar />
                  <SearchState defaultValue="" />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  <SortingState
                    defaultSorting={[
                      { columnName: "user_id", direction: "asc" },
                    ]}
                  />

                  <SelectionState
                    selection={this.state.selection}
                    onSelectionChange={onSelectionChange}
                  />

                  <IntegratedFiltering />
                  <IntegratedSelection />
                  <IntegratedSorting />
                  <IntegratedPaging />

                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />

                  <TableSelection
                    selectByRowClick
                    highlightRow
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

export default withTranslation()(Accounts);

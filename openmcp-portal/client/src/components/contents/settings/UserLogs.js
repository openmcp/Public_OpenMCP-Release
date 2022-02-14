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
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import { withTranslation } from "react-i18next";

class UserLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "user_id", title: "User ID" },
        { name: "description", title: "Activity" },
        { name: "etc", title: "Path" },
        { name: "code", title: "Code" },
        { name: "created_time", title: "Created Time" },
      ],
      defaultColumnWidths: [
        { columnName: "user_id", width: 130 },
        { columnName: "description", width: 300 },
        { columnName: "etc", width: 400 },
        { columnName: "code", width: 130 },
        { columnName: "created_time", width: 170 },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(`/settings/accounts/userLog`);
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
        utilLog.fn_insertPLogs(userId, "log-AC-VW02");
      })
      .catch((err) => console.log(err));
  }

  render() {
    // const { t } = this.props;
    const Cell = (props) => {
      // const { column } = props;
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

    return (
      <div className="sub-content-wrapper fulled">
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
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
                      { columnName: "created_time", direction: "desc" },
                    ]}
                  />

                  <IntegratedFiltering />
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

export default withTranslation()(UserLogs);

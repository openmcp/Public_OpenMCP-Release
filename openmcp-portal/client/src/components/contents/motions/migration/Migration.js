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
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
// import axios from "axios";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import ExcuteMigration from "../../modal/ExcuteMigration";
import { withTranslation } from 'react-i18next';

class Migration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Deployment" },
        { name: "status", title: "Ready" },
        { name: "cluster", title: "Cluster" },
        { name: "project", title: "Project" },
        { name: "image", title: "Image" },
        { name: "created_time", title: "Created Time" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 250 },
        { columnName: "status", width: 100 },
        { columnName: "cluster", width: 130 },
        { columnName: "project", width: 200 },
        { columnName: "image", width: 370 },
        { columnName: "created_time", width: 170 },
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
      clusterName: "",
      editorContext: `apiVersion: openmcp.k8s.io/v1alpha1
kind: OpenMCPDeployment
metadata:
  name: openmcp-deployment2
  namespace: openmcp
spec:
  replicas: 3
  labels:
      app: openmcp-nginx
  template:
    spec:
      template:
        spec:
          containers:
          - image: nginx
            name: nginx`,
      openProgress: false,
      anchorEl: null,
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
    AsyncStorage.getItem("g_clusters",(err, result) => {
      g_clusters = result.split(',');
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        g_clusters : g_clusters,
        ynOmcpDp: false,
       })
    };

    const response = await fetch(`/deployments`, requestOptions);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  //??????????????? ?????? ???????????? ???????????? ????????????.
  componentDidMount() {
    //???????????? ???????????? ????????? ????????????????????? ????????????.
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((result) => {
        this.setState({ rows: result });
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-MG-VW01");
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

  //???
  Cell = (props) => {
    console.log("CEll");
    // const { column, row } = props;
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

  render() {
    // const {t}= this.props;
    const onSelectionChange = (selection) => {
      // console.log(this.state.rows[selection[0]])
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      let selectedRows = [];
      selection.forEach((index)=>{
        selectedRows.push(this.state.rows[index]);
      })
      this.setState({
        selectedRow: selectedRows.length > 0 
          ? selectedRows
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
      <div className="sub-content-wrapper">
        {/* ????????? ?????? */}
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
                            {/* <MenuItem
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <SnapShotControl
                                title="create snapshot"
                                rowData={this.state.selectedRow}
                                onUpdateData={this.onUpdateData}
                                menuClose={handleClose}
                              />
                            </MenuItem> */}
                            <MenuItem
                              style={{
                                textAlign: "center",
                                display: "block",
                                fontSize: "14px",
                              }}
                            >
                              <ExcuteMigration
                                title=""
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
                  {/* ?????? */}
                  <SearchState defaultValue="" />

                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "created_time", direction: "desc" },
                    ]}
                  />

                  {/* ????????? */}
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

                  {/* ????????? */}
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

export default withTranslation()(Migration); 
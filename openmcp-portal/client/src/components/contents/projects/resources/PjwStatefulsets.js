import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import { Link } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
  // EditingState,
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
  // TableEditRow,
  // TableEditColumn,
  TableSelection,
} from "@devexpress/dx-react-grid-material-ui";
import Editor from "./../../../modules/Editor";
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from 'AsyncStorage';
// import PjDeploymentMigration from "./../../modal/PjDeploymentMigration";
// import queryString from 'query-string';
import axios from 'axios';
// import ProgressTemp from './../../../modules/ProgressTemp';
// import { NavigateNext} from '@material-ui/icons';
// import SnapShotControl from './../../modal/SnapShotControl';

import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import Grow from '@material-ui/core/Grow';
//import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { withTranslation } from 'react-i18next';

// let apiParams = "";
class PjwStatefulsets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
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
      clusterName : "",
      editorContext : `apiVersion: apps/v1
kind: StatefulSet
metadata:
  namespace: demo-project
  labels: {}
spec:
  replicas: 1
  selector:
    matchLabels: {}
  template:
    metadata:
      labels: {}
    spec:
      containers: []
      serviceAccount: default
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0
---
apiVersion: v1
kind: Service
metadata:
  namespace: demo-project
  labels: {}
spec:
  sessionAffinity: None
  selector: {}`,
      openProgress : false,
      anchorEl:null,
    };
  }

  componentWillMount() {
    
    // console.log(this.props.match.params.project)
    // const query = queryString.parse(this.props.location.search).cluster
    // console.log(query);
    // const result = {
    //   menu : "clusters",
    //   title : this.props.match.params.cluster
    // }
    // this.props.menuData(result);
    // apiParams = this.props.param;
  }

  callApi = async () => {

    // var param = this.props.match.params.cluster;
    // queryString = queryString.parse(this.props.location.search).cluster
    // console.log(this.props.match.params.project, this.props.location.search);
    const response = await fetch(
      `/projects/${this.props.match.params.project}/resources/workloads/statefulsets${this.props.location.search}`
    );
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
      .then((res) => {
        if(res == null){
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName",(err, result) => { 
          userId= result;
        })
        utilLog.fn_insertPLogs(userId, "log-PJ-VW04");
      })
      .catch((err) => console.log(err));


  }

  onUpdateData = () => {
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        this.setState({ 
          selection : [],
          selectedRow : "",
          rows: res });
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  excuteScript = (context) => {

    if(this.state.openProgress){
      this.setState({openProgress:false})
    } else {
      this.setState({openProgress:true})
    }

    const url = `/deployments/create`;
    const data = {
      yaml:context
    };
    // console.log(context)
    axios.post(url, data)
    .then((res) => {
        // alert(res.data.message);
        this.setState({ open: false });
        this.onUpdateData();
    })
    .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
    });
  }
  
  onRefresh = () => {
    if(this.state.openProgress){
      this.setState({openProgress:false})
    } else {
      this.setState({openProgress:true})
    }
    this.callApi()
      .then((res) => {
        this.setState({ 
          // selection : [],
          // selectedRow : "",
          rows: res });
      })
      .catch((err) => console.log(err));
  };

  closeProgress = () => {
    this.setState({openProgress:false})
  }

  render() {
    const {t} = this.props;
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
              value === "Warning"
                ? "orange"
                : value === "Unschedulable"
                ? "red"
                : value === "Stop"
                ? "red"
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

      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        // // console.log("name", props.value);
        // console.log("this.props.match.params", this.props)
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/projects/${this.props.match.params.project}/resources/workloads/statefulsets/${props.value}`,
                search: `cluster=${row.cluster}&project=${row.project}`,
                state: {
                  data: row,
                },
              }}
            >
              {props.value}
            </Link>
          </Table.Cell>
        );
      }
      return <Table.Cell>{props.value}</Table.Cell>;
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

    const onSelectionChange = (selection) => {
      // console.log(this.state.rows[selection[0]])
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({ selectedRow: this.state.rows[selection[0]] ? this.state.rows[selection[0]] : {} });
    };

    const handleClick = (event) => {
      if(this.state.anchorEl === null){
        this.setState({anchorEl : event.currentTarget});
      } else {
        this.setState({anchorEl : null});
      }
    };

    const handleClose = () => {
      this.setState({anchorEl : null});
    };

    const open = Boolean(this.state.anchorEl);

    return (
      <div className="sub-content-wrapper fulled">
        {this.state.clusterName}
        {/* ????????? ?????? */}
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                <div style={{
                  position: "absolute",
                  right: "21px",
                  top: "20px",
                  zIndex: "10",
                  textTransform: "capitalize",
                }}>
                  <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                 
                  <Popper open={open} anchorEl={this.state.anchorEl} role={undefined} transition disablePortal placement={'bottom-end'}>
                    {({ TransitionProps, placement }) => (
                      <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center top' }}
                      >
                        <Paper>
                          <MenuList autoFocusItem={open} id="menu-list-grow">
                              {/*<MenuItem 
                                style={{ textAlign: "center", display: "block", fontSize:"14px"}}
                              >
                                 <SnapShotControl
                                  title="create snapshot"
                                  rowData={this.state.selectedRow}
                                  onUpdateData = {this.onUpdateData}
                                  menuClose={handleClose}
                                />
                              </MenuItem>
                              <MenuItem 
                                style={{ textAlign: "center", display: "block", fontSize:"14px"}}
                              >
                                <PjDeploymentMigration
                                  title="pod migration"
                                  rowData={this.state.selectedRow}
                                  onUpdateData = {this.onUpdateData}
                                  menuClose={handleClose}
                                />
                              </MenuItem> */}
                              <MenuItem 
                              onKeyDown={(e) => e.stopPropagation()}
                                // onClick={handleClose}
                                style={{ textAlign: "center", display: "block", fontSize:"14px"}}
                              >
                                <Editor btTitle={t("projects.detail.resources.workloads.statefulsets.pop-create.btn-create")} title={t("projects.detail.resources.workloads.statefulsets.pop-create.title")} context={this.state.editorContext} excuteScript={this.excuteScript} menuClose={handleClose}/>
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
                  defaultSorting={[{ columnName: 'created_time', direction: 'desc' }]}
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

                  <IntegratedFiltering />
                  <IntegratedSorting />
                  <IntegratedSelection />
                  <IntegratedPaging />

                  {/* ????????? */}
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
                    // showSelectionColumn={false}
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

export default withTranslation()(PjwStatefulsets); 
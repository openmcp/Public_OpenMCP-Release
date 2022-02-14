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
// import Editor from "./../../../modules/Editor";
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from 'AsyncStorage';
import axios from 'axios';

// import IconButton from '@material-ui/core/IconButton';
// import MenuItem from '@material-ui/core/MenuItem';
// import MoreVertIcon from '@material-ui/icons/MoreVert';

// import Popper from '@material-ui/core/Popper';
// import MenuList from '@material-ui/core/MenuList';
// import Grow from '@material-ui/core/Grow';


// let apiParams = "";
class PjwDeployments extends Component {
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
      editorContext : `apiVersion: openmcp.k8s.io/v1alpha1
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
      openProgress : false,
      anchorEl:null,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(
      `/projects/${this.props.match.params.project}/resources/workloads/deployments${this.props.location.search}`
    );
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
        utilLog.fn_insertPLogs(userId, "log-PJ-VW03");
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
    axios.post(url, data)
    .then((res) => {
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
          rows: res });
      })
      .catch((err) => console.log(err));
  };

  closeProgress = () => {
    this.setState({openProgress:false})
  }

  render() {
    const HighlightedCell = ({ value, style, row, ...restProps }) => (
      <Table.Cell
        {...restProps}
        style={{
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

    const Cell = (props) => {
      const { column, row } = props;

      if (column.name === "status") {
        return <HighlightedCell {...props} />;
      } else if (column.name === "name") {
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            <Link
              to={{
                pathname: `/projects/${this.props.match.params.project}/resources/workloads/deployments/${props.value}`,
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
        }}
      />
    );
    const Row = (props) => {
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    const onSelectionChange = (selection) => {
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({ selectedRow: this.state.rows[selection[0]] ? this.state.rows[selection[0]] : {} });
    };

    // const handleClick = (event) => {
    //   if(this.state.anchorEl === null){
    //     this.setState({anchorEl : event.currentTarget});
    //   } else {
    //     this.setState({anchorEl : null});
    //   }
    // };

    // const handleClose = () => {
    //   this.setState({anchorEl : null});
    // };

    // const open = Boolean(this.state.anchorEl);

    return (
      <div className="sub-content-wrapper fulled">
        {this.state.clusterName}
        {/* 컨텐츠 헤더 */}
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                // <div style={{
                //   position: "absolute",
                //   right: "21px",
                //   top: "20px",
                //   zIndex: "10",
                //   textTransform: "capitalize",
                // }}>
                //   <IconButton
                //     aria-label="more"
                //     aria-controls="long-menu"
                //     aria-haspopup="true"
                //     onClick={handleClick}
                //   >
                //     <MoreVertIcon />
                //   </IconButton>
                 
                //   <Popper open={open} anchorEl={this.state.anchorEl} role={undefined} transition disablePortal placement={'bottom-end'}>
                //     {({ TransitionProps, placement }) => (
                //       <Grow
                //       {...TransitionProps}
                //       style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center top' }}
                //       >
                //         <Paper>
                //           <MenuList autoFocusItem={open} id="menu-list-grow">
                //               <MenuItem 
                //               onKeyDown={(e) => e.stopPropagation()}
                //                 // onClick={handleClose}
                //                 style={{ textAlign: "center", display: "block", fontSize:"14px"}}
                //               >
                //                 <Editor btTitle="create" title="Create Deployment" context={this.state.editorContext} excuteScript={this.excuteScript} menuClose={handleClose}/>
                //               </MenuItem>
                //             </MenuList>
                //           </Paper>
                //       </Grow>
                //     )}
                //   </Popper>
                // </div>,
                <Grid rows={this.state.rows} columns={this.state.columns}>
                  <Toolbar />
                  <SearchState defaultValue="" />
                  <SearchPanel style={{ marginLeft: 0 }} />
                  <SortingState
                  defaultSorting={[{ columnName: 'created_time', direction: 'desc' }]}
                  />
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <PagingPanel pageSizes={this.state.pageSizes} />
                  <SelectionState
                    selection={this.state.selection}
                    onSelectionChange={onSelectionChange}
                  />
                  <IntegratedFiltering />
                  <IntegratedSorting />
                  <IntegratedSelection />
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

export default PjwDeployments;

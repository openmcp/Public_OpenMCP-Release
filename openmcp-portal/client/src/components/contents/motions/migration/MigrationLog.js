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
import * as utilLog from '../../../util/UtLogs.js';
import { AsyncStorage } from 'AsyncStorage';
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { convertUTCTime } from "../../../util/Utility.js";
import LinearProgressBar2 from "../../../modules/LinearProgressBar2.js";

class MigrationLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        // deployment, currentCluster, targetCluster, start, end, status
        { name: "name", title: "Migration"},
        { name: "deployment", title: "Deployment"},
        { name: "progress", title: "progress"},
        { name: "status", title: "status"},
        { name: "isZeroDownTime", title: "IsZeroDownTime"},
        { name: "description", title: "Description"},
        { name: "sourceCluster", title: "Source Cluster"},
        { name: "targetCluster", title: "Target Cluster"},
        { name: "namespace", title: "Namespace"},
        { name: "creationTime", title: "Created Time"},
        { name: "elapsedTime", title: "Elapsed Time"},
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 300 },
        { columnName: "deployment", width: 100 },
        { columnName: "progress", width: 100 },
        { columnName: "status", width: 120 },
        { columnName: "isZeroDownTime", width: 100 },
        { columnName: "description", width: 200 },
        { columnName: "sourceCluster", width: 130 },
        { columnName: "targetCluster", width: 130 },
        { columnName: "namespace", width: 120 },
        { columnName: "creationTime", width: 150 },
        { columnName: "elapsedTime", width: 110 },
      ],
      rows: "",
      selectedRowData:"",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 30,
      pageSizes: [30, 40, 50, 0],

      completed: 0,
      onClickUpdatePolicy: false,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(`/apis/migration/log`);
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
      if(res === null){
        this.setState({ rows: [] });
      } else {
        this.setState({ rows: res });
      }
      clearInterval(this.timer);
      let userId = null;
      AsyncStorage.getItem("userName",(err, result) => { 
        userId= result;
      })
      utilLog.fn_insertPLogs(userId, 'log-MG-VW02');
      
      this.timer = setInterval(this.repeatApiCall, 5000);
    })
    .catch((err) => console.log(err));

  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  repeatApiCall=()=>{
    this.callApi()
    .then((res) => {
      if(res === null){
        this.setState({ rows: [] });
      } else {
        this.setState({ rows: res });
        console.log("repeat");
      }
    })
    .catch((err) => console.log(err));
  }

  onUpdateData = () => {
    this.setState({
      selection : [],
      selectedRow:"",
    })
    this.callApi()
      .then((res) => {
        if(res === null){
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  onClickUpdatePolicy = (rowData) => {
    this.setState({
      onClickUpdatePolicy: true,
      selectedRowData : rowData
    })
  }

  onCloseUpdatePolicy = (value) => {
    this.setState({onClickUpdatePolicy:value})
  }

  render() {
    const Cell = (props) => {
      const { column } = props;

      const fn_linearProgressBar = () =>{
        var percent ='';
        if(props.value.indexOf(".") > -1) {
          percent = props.value.split(".")[0]
        } else {
          percent = props.value.split("%")[0];
        }

        
        return (
          <div>
            <p>{percent + `%`}</p>
            <p style={{marginTop:"5px"}}>
              <LinearProgressBar2 value={percent} total={100} mColor={"normalColor"} bColor={"normalBaseColor"}/>
            </p>
          </div>
        )
      }

      if (
        column.name === "status"
      ) {
        return (
          <Table.Cell
            {...props}
            // style={{ cursor: "pointer" }}
            aria-haspopup="true"
          >
            <div style={{ position: "relative", top: "-3px" }}>
              {props.value === "Success" ? 
                <CheckCircleIcon
                        style={{
                        fontSize: "24px",
                        marginRight: "5px",
                        position: "relative",
                        top: "5px",
                        color: "#00B80F",
                      }}
                    />
              : props.value === "Running" ? 
                <CheckCircleIcon
                        style={{
                        fontSize: "24px",
                        marginRight: "5px",
                        position: "relative",
                        top: "5px",
                        color: "#2579E7",
                      }}
                    />
              :
              <WarningRoundedIcon
                style={{
                  fontSize: "24px",
                  marginRight: "5px",
                  position: "relative",
                  top: "5px",
                  color:"#dc0505",
                }}
              />
              }
              <span>{props.value}</span>
            </div>
          </Table.Cell>
        );
      } else if (column.name === "creationTime"){
        return (
        <Table.Cell
            {...props}
          >
              <span>{convertUTCTime(new Date(props.value), "%Y-%m-%d %H:%M:%S", false)}</span>
          </Table.Cell>)
      } else if (column.name === "progress"){
        return (<Table.Cell>
        {fn_linearProgressBar()}
        </Table.Cell>)
      // 
      } else {
        return <Table.Cell>{props.value}</Table.Cell>;
      }
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
      return <Table.Row {...props} key={props.tableRow.key}/>;
    };

    return (
      <div className="sub-content-wrapper fulled">
        <section className="content" style={{ position: "relative" }}>
          <Paper>
            {this.state.rows ? (
              [
                <Grid
                  rows={this.state.rows}
                  columns={this.state.columns}
                >
                  <Toolbar />
                  <SearchState defaultValue="" />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  <PagingState defaultCurrentPage={0} defaultPageSize={this.state.pageSize} />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  <SortingState
                    defaultSorting={[{ columnName: 'creationTime', direction: 'desc' }]}
                  />
               
                  <IntegratedFiltering />
                  <IntegratedSorting />
                  <IntegratedPaging />

                  <Table cellComponent={Cell} rowComponent={Row} />
                  <TableColumnResizing defaultColumnWidths={this.state.defaultColumnWidths} />
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

export default MigrationLog;

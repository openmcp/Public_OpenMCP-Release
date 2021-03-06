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
import * as utilLog from '../../util/UtLogs.js';
import { AsyncStorage } from 'AsyncStorage';
import axios from 'axios';
import { FaCube } from "react-icons/fa";
// import { NavLink } from "react-router-dom";
// import { NavigateNext} from '@material-ui/icons';
// import Editor from "./../../modules/Editor";
// import ProgressTemp from './../../modules/ProgressTemp';
import { withTranslation } from 'react-i18next';

// let apiParams = "";
class HPA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 300 },
        { columnName: "namespace", width: 130 },
        { columnName: "cluster", width: 130 },
        { columnName: "reference", width: 200 },
        { columnName: "min_repl", width: 80 },
        { columnName: "max_repl", width: 80 },
        { columnName: "current_repl", width: Infinity },
      ],
      rows: "",

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10, 
      pageSizes: [5, 10, 15, 0],

      completed: 0,
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
      openProgress:false,
    };
  }

  componentWillMount() {
    // this.props.menuData("none");
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
      body: JSON.stringify({ g_clusters : g_clusters })
    };

    const response = await fetch(`/hpa`,requestOptions);
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
        utilLog.fn_insertPLogs(userId, 'log-PD-VW02');
      })
      .catch((err) => console.log(err));

  };

  onRefresh = () => {
    if(this.state.openProgress){
      this.setState({openProgress:false})
    } else {
      this.setState({openProgress:true})
    }
    this.callApi()
      .then((res) => {
        if(res === null){
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
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
    console.log(context)
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

  closeProgress = () => {
    this.setState({openProgress:false})
  }

  render() {
    const {t} = this.props;
    const columns= [
      { name: "name", title: t("pods.hpa.grid.name") },
      { name: "namespace", title: t("pods.hpa.grid.project") },
      { name: "cluster", title:t("pods.hpa.grid.cluster")},
      { name: "reference", title: t("pods.hpa.grid.reference")},
      { name: "min_repl", title: t("pods.hpa.grid.min")},
      { name: "max_repl", title: t("pods.hpa.grid.max") },
      { name: "current_repl", title: t("pods.hpa.grid.replicas") },
    ];

    const rectangle = (status, pId) => {
      return (

        [
          <div>
            <FaCube className="cube" style={{ 
              color: status === "ready" ? "#367fa9" : "#ececec",
            }}/>
          </div>,
          // <div className="rectangle"
          //   id={pId}
          //   style={{ 
          //     backgroundColor: status === "ready" ? "#367fa9" : "orange",
          //   }}
            
          // />
        ]
      );
    };
    //???
    const Cell = (props) => {
      const { column } = props;
      // if (column.name === "name") {
      //   return (
      //     <Table.Cell
      //       {...props}
      //       style={{ cursor: "pointer" }}
      //     ><Link to={{
      //       pathname: `/pods/${props.value}`,
      //       state: {
      //         data : row
      //       }
      //     }}>{props.value}</Link></Table.Cell>
      //   );
      // } else 
      
      if (column.name === "current_repl") {
        return (
          <Table.Cell>
            <div className="replica-set">
              {[...Array(props.row.min_repl)].map((n, index) => {
                  return (
                      <div>
                          {rectangle("ready")}
                      </div>
                  )
              })}
              {[...Array(props.row.max_repl-props.row.min_repl)].map((n, index) => {
                  return (
                      <div>
                          {rectangle("notReady")}
                      </div>
                  )
              })}
            </div>
          </Table.Cell>
        )
        // min_repl
        // max_repl



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
      return <Table.Row {...props} key={props.tableRow.key}/>;
    };

    return (
      <div className="sub-content-wrapper">
        {/* {this.state.openProgress ? <ProgressTemp openProgress={this.state.openProgress} closeProgress={this.closeProgress}/> : ""} */}
        {this.state.clusterName}
        {/* ????????? ?????? */}
          {/* <Editor btTitle="create" title="Create HAS" context={this.state.editorContext} excuteScript={this.excuteScript}/> */}
        {/* <section className="content-header"  onClick={this.onRefresh} style={{position:"relative"}}>
          <h1>
          <span>
          HPA
          </span>
            <small>(Horizental Pod Autoscaler)</small>
         
          </h1>
          <ol className="breadcrumb">
            <li>
              <NavLink to="/dashboard">Home</NavLink>
            </li>
            <li className="active">
              <NavigateNext style={{fontSize:12, margin: "-2px 2px", color: "#444"}}/>
              Pods
            </li>
          </ol>
        </section> */}
        <section className="content" style={{ position: "relative" }}>
          {/* <div className="HPA-TEMP">
            HPA
            <small> (Horizental Pod Autoscaler)</small>
          </div> */}
          <Paper>
            {this.state.rows ? (
              [
                
                <Grid
                  rows={this.state.rows}
                  columns={columns}
                >
                  <Toolbar />
                  {/* ?????? */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[{ columnName: 'status', direction: 'desc' }]}
                  />
                  <IntegratedSorting />

                  {/* ????????? */}
                  <PagingState defaultCurrentPage={0} defaultPageSize={this.state.pageSize} />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* ????????? */}
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

export default withTranslation()(HPA); 

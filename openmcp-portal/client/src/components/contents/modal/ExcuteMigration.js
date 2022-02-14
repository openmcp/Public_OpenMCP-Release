import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
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
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
  TableSelection,
} from "@devexpress/dx-react-grid-material-ui";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { dateFormat, fn_goLoginPage, fn_tokenValid } from "../../util/Utility.js";
import { withTranslation } from 'react-i18next';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

class ExcuteMigration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
        { name: "status", title: "Status" },
        { name: "nodes", title: "nodes" },
        { name: "cpu", title: "CPU(%)" },
        { name: "ram", title: "Memory(%)" },
        { name: "region", title: "Region" },
        { name: "zone", title: "Zone" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 130 },
        { columnName: "status", width: 130 },
        { columnName: "nodes", width: 130 },
        { columnName: "cpu", width: 100 },
        { columnName: "ram", width: 120 },
        { columnName: "region", width: 130 },
        { columnName: "zone", width: 130 },
      ],
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],
      open: false,
      dpCount: 0,
      dpInfo: [],
      clusters: [],
      selection: [],
      selectedRow: "",
      completed: 0,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters",(err, result) => { 
      g_clusters = result.split(',');
    });

    let accessToken;
    AsyncStorage.getItem("token", (err, result) => {
      accessToken = result;
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ g_clusters : g_clusters })
    };

    const response = await fetch("/clusters", requestOptions);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  handleClickOpen = () => {
    const {t} = this.props;
    if (Object.keys(this.props.rowData).length === 0) {
      alert(t("migrations.migration.pop-migration.msg.chk-selectDeployment"));
      this.setState({ open: false });
      return;
    }

    this.timer = setInterval(this.progress, 20);
    let dpCnt = this.props.rowData.length;
    let info = [];
    this.props.rowData.forEach((dp) => {
      info.push({ name: dp.name, cluster: dp.cluster });
    });

    this.setState({
      open: true,
      dpCount: dpCnt,
      dpInfo: info,
      selection: [],
    });

    this.callApi()
      .then(async (res) => {
        if(res === null){
          this.setState({ clusters: [] });
        } else {
          let result = await fn_tokenValid(res);
          if(result === "valid"){
            this.setState({ clusters: res });
          } else if (result === "refresh"){
            this.onRefresh();
          } else {
            fn_goLoginPage(this.props.propsData.info.history);
          }
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  onRefresh = () => {
    this.callApi()
    .then((res) => {
      if(res === null){
        this.setState({ clusters: [] });
      } else {
        this.setState({ clusters: res });
      }
    })
    .catch((err) => console.log(err));
  };



  handleClose = () => {
    this.setState({
      project_name: "",
      project_description: "",
      cluster: this.state.firstValue,
      open: false,
    });
    this.props.menuClose();
  };

  handleSave = (e) => {
    const {t}=this.props;
    if (Object.keys(this.state.selectedRow).length === 0) {
      alert(t("common.msg.unselected-target"));
      return;
    }

    const url = `/apis/migration`;
    const data = {
      cluster : "openmcp",
      namespace : this.props.rowData[0].project,
      value : {
        "apiVersion": "openmcp.k8s.io/v1alpha1",
        "kind": "Migration",
        "metadata": {
          "name": "migration-"+ dateFormat(new Date (), "%Y%m%d%H%M%S", false),
          "namespace": "openmcp"
        },
        "spec": {
          "migrationServiceSource": [
            {
              "sourceCluster": this.props.rowData[0].cluster,
              "targetCluster": this.state.selectedRow[0].name,
              "nameSpace": this.props.rowData[0].project,
              "serviceName": "migration-srv",
              "migrationSource": [
                {
                  "resourceName": this.props.rowData[0].name,
                  "resourceType": "Deployment"
                }
              ]
            }
          ]
        }
      }
    }


    axios
      .post(url, data)
      .then((res) => {
        alert(t("migrations.migration.pop-migration.msg.completedRequest"));
        this.setState({ open: false });
        this.props.onUpdateData();
        this.props.menuClose();
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });

    this.props.onUpdateData();

    // loging deployment migration
    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-MG-EX01");

    //close modal popup
    this.setState({ open: false });
    this.props.menuClose();
  };

  render() {
    const {t} = this.props;
    const DialogTitle = withStyles(styles)((props) => {
      const { children, classes, onClose, ...other } = props;
      return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
          <Typography variant="h6">{children}</Typography>
          {onClose ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
      );
    });

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

    const onSelectionChange = (selection) => {
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      let selectedRows = [];
      selection.forEach((index) => {
        selectedRows.push(this.state.clusters[index]);
      });
      this.setState({
        selectedRow: selectedRows.length > 0 ? selectedRows : {},
      });
    };

    return (
      <div>
        {/* <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            // position: "absolute",
            // right: "115px",
            // top: "26px",
            zIndex: "10",
            width: "148px",
            textTransform: "capitalize",
          }}
        >
          Migration
        </Button> */}
        <div
          // variant="outlined"
          // color="primary"
          onClick={this.handleClickOpen}
          style={{
            // position: "absolute",
            // right: "115px",
            // top: "26px",
            zIndex: "10",
            width: "148px",
            textTransform: "capitalize",
          }}
        >
          {t("migrations.migration.pop-migration.btn-migration")}
        </div>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
          {t("migrations.migration.pop-migration.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="md-contents-body migration">
              <section className="md-content">
                {/* deployment informations */}
                <p>{t("migrations.migration.pop-migration.targetDeployments.title")}</p>
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#f1f1f1",
                    minWidth: "900px",
                  }}
                >
                  {this.state.dpInfo.map((item, idx) => {
                    return (
                      <div id="md-content-info">
                        <div class="md-partition">
                          <div class="md-item">
                            <span>
                              <strong>{idx + 1}. Name : </strong>
                            </span>
                            <span>{item.name}</span>
                          </div>
                        </div>
                        <div class="md-partition">
                          <div class="md-item">
                            <span>
                              <strong>Current Cluster : </strong>
                            </span>
                            <span>{item.cluster}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="md-content" style={{ minHeight: "200px" }}>
                <p>{t("migrations.migration.pop-migration.selectCluster.title")}</p>
                {/* cluster selector */}
                <Paper>
                  {this.state.clusters.length > 0 ? (
                    <Grid
                      rows={this.state.clusters}
                      columns={this.state.columns}
                    >
                      {/* <Toolbar /> */}
                      {/* 검색 */}
                      {/* <SearchState defaultValue="" />
                  <SearchPanel style={{ marginLeft: 0 }} /> */}

                      {/* Sorting */}
                      <SortingState
                        defaultSorting={[
                          { columnName: "status", direction: "asc" },
                        ]}
                      />

                      {/* 페이징 */}
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

                      {/* 테이블 */}
                      <Table />
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
                    </Grid>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        borderBottom: "0.5px solid #ececec4f",
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={this.state.completed}
                        style={{
                          position: "absolute",
                          left: "50%",
                          marginTop: "20px",
                        }}
                      ></CircularProgress>
                    </div>
                  )}
                </Paper>
              </section>
            </div>
            {/* <div className="pj-create">
              <div className="create-content">
                <p>Deployment</p>
                <TextField
                  id="outlined-multiline-static"
                  label="name"
                  rows={1}
                  variant="outlined"
                  defaultValue = {this.props.rowData.name}
                  fullWidth	={true}
                  name="deployment_name"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <p className="pj-cluster">Cluster</p>
                <SelectBox className="selectbox" rows={this.state.selectBoxData} onSelectBoxChange={onSelectBoxChange}  defaultValue={this.state.cluster}></SelectBox>
              </div>
            </div> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSave} color="primary">
              {t("common.btn.execution")}
            </Button>
            <Button onClick={this.handleClose} color="primary">
            {t("common.btn.cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

// function dateFormat (date, fstr, utc) {
//   utc = utc ? 'getUTC' : 'get';
//   return fstr.replace (/%[YmdHMS]/g, function (m) {
//     switch (m) {
//     case '%Y': return date[utc + 'FullYear']().toString().substr(2); // no leading zeros required
//     case '%m': m = 1 + date[utc + 'Month'] (); break;
//     case '%d': m = date[utc + 'Date'] (); break;
//     case '%H': m = date[utc + 'Hours'] (); break;
//     case '%M': m = date[utc + 'Minutes'] (); break;
//     case '%S': m = date[utc + 'Seconds'] (); break;
//     default: return m.slice (1); // unknown code, remove %
//     }
//     // add leading zero if required
//     return ('0' + m).slice (-2);
//   });
// }

export default withTranslation()(ExcuteMigration); 
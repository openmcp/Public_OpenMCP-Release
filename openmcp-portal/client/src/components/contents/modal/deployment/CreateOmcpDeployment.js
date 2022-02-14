import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
// import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FiberManualRecordSharpIcon from "@material-ui/icons/FiberManualRecordSharp";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  TextField,
} from "@material-ui/core";
import {
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
  SelectionState,
  IntegratedSelection,
  TableColumnVisibility,
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
// import axios from "axios";
import LensIcon from "@material-ui/icons/Lens";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { fn_goLoginPage, fn_tokenValid } from "../../../util/Utility.js";
import { withTranslation } from "react-i18next";
import AceEditor from "react-ace";

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
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
});

let context;
class CreateOmcpDeployment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      namespace: "",
      replicas: "",
      containerImage: "",
      containerPort: "",
      rows: [],
      selectedClusters: [],
      clusterSelectionId: [],
      activeStep: 0,
      open: false,
    };
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

    onChangeEditor = (newValue) => {
    context = newValue;
  };

  componentWillMount() {}

  handleClickOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      name: "",
      namespace: "",
      replicas: "",
      containerImage: "",
      containerPort: "",
      rows: [],
      selectedClusters: [],
      clusterSelectionId: [],
      activeStep: 0,
      open: false,
    });
    this.props.menuClose();
  };

  handleSave = (e) => {
    const { t } = this.props;
    if (this.state.name === "") {
      alert(t("deployments.pop-create.msg.chk-name"));
      return;
    } else if (this.state.namespace === "") {
      alert(t("deployments.pop-create.msg.chk-namespace"));
      return;
    } else if (this.state.replicas === "") {
      alert(t("deployments.pop-create.msg.chk-replicas"));
      return;
    } else if (this.state.containerImage === "") {
      alert(t("deployments.pop-create.msg.chk-containerImage"));
      return;
    } else if (this.state.containerPort === "") {
      alert(t("deployments.pop-create.msg.chk-containerPort"));
      return;
    } else if (Object.keys(this.state.selectedClusters).length === 0) {
      alert(t("groupRole.pop-create.msg.chk-clusters"));
      return;
    }

    
    this.props.excuteScript(context);
    this.setState({ open: false });
    this.props.menuClose();
  };

  onSelectClusters = (rows, selectionId) => {
    let clusters = [];
    rows.forEach((cluster) => {
      clusters.push(cluster.name);
    });

    this.setState({
      selectedClusters: clusters,
      clusterSelectionId: selectionId,
    });
  };

  handleNext = () => {
    const { t } = this.props;
    switch (this.state.activeStep) {
      case 0:
        if (this.state.name === "") {
          alert(t("deployments.pop-create.msg.chk-name"));
          return;
        } else if (this.state.namespace === "") {
          alert(t("deployments.pop-create.msg.chk-namespace"));
          return;
        } else if (this.state.replicas === "") {
          alert(t("deployments.pop-create.msg.chk-replicas"));
          return;
        } else if (this.state.containerImage === "") {
          alert(t("deployments.pop-create.msg.chk-containerImage"));
          return;
        } else if (this.state.containerPort === "") {
          alert(t("deployments.pop-create.msg.chk-containerPort"));
          return;
        } else {
          this.setState({ activeStep: this.state.activeStep + 1 });
          return;
        }
      case 1:
        if (Object.keys(this.state.selectedClusters).length === 0) {
          alert(t("groupRole.pop-create.msg.chk-clusters"));
          return;
        } else {
          //create yaml scripts

          const clusters = this.state.selectedClusters;
          let clustersYaml = ''
          clusters.forEach(item => {
            clustersYaml = clustersYaml + `\n  - ${item}`
          })

          context = `apiVersion: openmcp.k8s.io/v1alpha1
kind: OpenMCPDeployment
metadata:
  name: ${this.state.name}
  namespace: ${this.state.namespace}
spec:
  clusters: ${clustersYaml}
  replicas: ${this.state.replicas}
  template:
    spec:
      template:
        spec:
          containers:
          - image: ${this.state.name}
            imagePullPolicy: IfNotPresent
            name: ${this.state.containerImage}
            ports:
            - containerPort: ${this.state.containerPort}`

          this.setState({ activeStep: this.state.activeStep + 1 });
          return;
        }
      default:
        
        return;
    }
  };

  handleBack = () => {
    // const { t } = this.props;
    this.setState({ activeStep: this.state.activeStep - 1 });
  };

  render() {
    const { t } = this.props;
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

    const steps = [
      t("deployments.pop-create.step.1.title"),
      t("deployments.pop-create.step.2.title"),
      t("deployments.pop-create.step.3.title"),
    ];

    return (
      <div>
        <div
          onClick={this.handleClickOpen}
          style={{
            zIndex: "10",
            width: "148px",
            textTransform: "capitalize",
          }}
        >
          {this.props.btTitle}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {this.props.title}
          </DialogTitle>
          <DialogContent dividers>
            <div className="md-contents-body small-grid">
              <Stepper activeStep={this.state.activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <div>
                <Typography>
                  {this.state.activeStep === 0 ? (
                    <div style={{ paddingBottom: "16px" }}>
                      <section className="md-content">
                        <p>Name</p>
                        <TextField
                          id="outlined-multiline-static"
                          rows={1}
                          placeholder="deployment name"
                          variant="outlined"
                          value={this.state.name}
                          fullWidth={true}
                          name="name"
                          onChange={this.onChange}
                        />
                      </section>
                      <section className="md-content">
                        <p>Namespace</p>
                        <TextField
                          id="outlined-multiline-static"
                          rows={1}
                          placeholder="deployment namespace"
                          variant="outlined"
                          value={this.state.namespace}
                          fullWidth={true}
                          name="namespace"
                          onChange={this.onChange}
                        />
                      </section>
                      <section className="md-content">
                        <p>Replicas</p>
                        <TextField
                          id="outlined-multiline-static"
                          type="number"
                          rows={1}
                          placeholder="replica number"
                          variant="outlined"
                          value={this.state.replicas}
                          fullWidth={true}
                          name="replicas"
                          onChange={this.onChange}
                        />
                      </section>
                      <section className="md-content">
                        <p>Container Image</p>
                        <TextField
                          id="outlined-multiline-static"
                          rows={1}
                          placeholder="container image"
                          variant="outlined"
                          value={this.state.containerImage}
                          fullWidth={true}
                          name="containerImage"
                          onChange={this.onChange}
                        />
                      </section>
                      <section className="md-content">
                        <p>Container Port</p>
                        <TextField
                          id="outlined-multiline-static"
                          type="number"
                          rows={1}
                          placeholder="container port number"
                          variant="outlined"
                          value={this.state.containerPort}
                          fullWidth={true}
                          name="containerPort"
                          onChange={this.onChange}
                        />
                      </section>
                    </div>
                  ) : this.state.activeStep === 1 ? (
                    <section className="md-content">
                      <DpClusters
                        selection={this.state.clusterSelectionId}
                        onselectedClusters={this.onSelectClusters}
                        propsData={this.props.propsData}
                        t={t}
                      />
                    </section>
                  ) : (
                    <section className="md-content">
                      <AceEditor
                        mode="yaml"
                        theme="nord_dark"
                        onChange={this.onChangeEditor}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{ $blockScrolling: true }}
                        width="100%"
                        fontSize="0.875rem"
                        style={{ lineHeight: "1.05rem" }}
                        value={context}
                        readOnly={false}
                      />
                      
                      {/* <GrUsers 
                    selection={this.state.userSelectionId}
                    onSelectedUsers={this.onSelectUsers}
                    t={t}
                  /> */}
                    </section>
                  )}
                </Typography>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <div>
              <Button
                disabled={this.state.activeStep === 0}
                onClick={this.handleBack}
              >
                {t("common.btn.back")}
              </Button>
              {this.state.activeStep === steps.length - 1 ? (
                <Button onClick={this.handleSave} color="primary">
                  {t("common.btn.execution")}
                </Button>
              ) : (
                <Button color="primary" onClick={this.handleNext}>
                  {t("common.btn.next")}
                </Button>
              )}
            </div>
            {/* <Button onClick={this.handleSave} color="primary">
              save
            </Button> */}
            <Button onClick={this.handleClose} color="primary">
              {t("common.btn.cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

class DpClusters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
        { name: "status", title: "Status" },
        { name: "nodes", title: "nodes" },
        { name: "cpu", title: "CPU(%)" },
        { name: "ram", title: "Memory(%)" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 180 },
        { columnName: "status", width: 130 },
        { columnName: "nodes", width: 100 },
        { columnName: "cpu", width: 100 },
        { columnName: "ram", width: 120 },
      ],
      rows: [],

      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 0,
      pageSizes: [0],

      selection: this.props.selection,
      selectedRow: [],
      completed: 0,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    let accessToken;
    AsyncStorage.getItem("token", (err, result) => {
      accessToken = result;
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };

    const response = await fetch("/clusters", requestOptions);
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
      .then(async (res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          let resData = res;
          let result = await fn_tokenValid(res);

          if (result === "valid") {
            this.setState({ rows: resData });
            let selectedRows = [];
            this.props.selection.forEach((index) => {
              selectedRows.push(resData[index]);
            });
            this.setState({ selectedRow: selectedRows });
          } else if (result === "refresh") {
            this.onRefresh();
          } else {
            fn_goLoginPage(this.props.propsData.info.history);
          }
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  }

  onRefresh = () => {
    this.timer = setInterval(this.progress, 20);

    this.callApi()
      .then(async (res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
          let selectedRows = [];
          this.props.selection.forEach((index) => {
            selectedRows.push(res[index]);
          });
          this.setState({ selectedRow: selectedRows });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  render() {
    const t = this.props.t;
    const HighlightedCell = ({ value, style, row, ...restProps }) => {
      var cpuPct =
        (parseFloat(row.cpu.split("/")[0]) /
          parseFloat(row.cpu.split("/")[1].split(" Core")[0])) *
        100;
      var memPct =
        (parseFloat(row.ram.split("/")[0]) /
          parseFloat(row.ram.split("/")[1].split(" Gi")[0])) *
        100;
      var status = cpuPct >= 90 || memPct >= 90 ? "Warning" : value;
      return (
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
                status === "Healthy"
                  ? "#1ab726"
                  : status === "Unhealthy"
                  ? "red"
                  : status === "Unknown"
                  ? "#b5b5b5"
                  : status === "Warning"
                  ? "#ff8042"
                  : "black",
            }}
          >
            <FiberManualRecordSharpIcon
              style={{
                fontSize: 12,
                marginRight: 4,
                backgroundColor:
                  status === "Healthy"
                    ? "rgba(85,188,138,.1)"
                    : status === "Unhealthy"
                    ? "rgb(152 13 13 / 10%)"
                    : status === "Unknown"
                    ? "rgb(255 255 255 / 10%)"
                    : status === "Warning"
                    ? "rgb(109 31 7 / 10%)"
                    : "white",
                boxShadow:
                  status === "Healthy"
                    ? "0 0px 5px 0 rgb(85 188 138 / 36%)"
                    : status === "Unhealthy"
                    ? "rgb(188 85 85 / 36%) 0px 0px 5px 0px"
                    : status === "Unknown"
                    ? "rgb(255 255 255 / 10%)"
                    : status === "Warning"
                    ? "rgb(188 114 85 / 36%) 0px 0px 5px 0px"
                    : "white",
                borderRadius: "20px",
                // WebkitBoxShadow: "0 0px 1px 0 rgb(85 188 138 / 36%)",
              }}
            ></FiberManualRecordSharpIcon>
          </span>

          <span
            style={{
              color:
                status === "Healthy"
                  ? "#1ab726"
                  : status === "Unhealthy"
                  ? "red"
                  : status === "Unknown"
                  ? "#b5b5b5"
                  : status === "Warning"
                  ? "#ff8042"
                  : "black",
            }}
          >
            {status}
          </span>
        </Table.Cell>
      );
    };

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

      const { column } = props;
      // console.log("cell : ", props);
      if (column.name === "status") {
        return <HighlightedCell {...props} />;
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

    const onSelectionChange = (selection) => {
      let selectedRows = [];
      selection.forEach((id) => {
        selectedRows.push(this.state.rows[id]);
      });
      this.setState({ selectedRow: selectedRows});
      this.setState({ selection: selection });

      this.props.onselectedClusters(selectedRows, selection);
    };

    return (
      <div>
        <p>{t("groupRole.pop-create.step.2.selectClusters.title")}</p>
        <div
          id="md-content-info"
          style={{ display: "block", minHeight: "95px", marginBottom: "10px" }}
        >
          {this.state.selectedRow.length > 0 ? (
            this.state.selectedRow.map((row) => {
              return (
                <span>
                  <LensIcon style={{ fontSize: "8px", marginRight: "5px" }} />
                  {row.name}
                </span>
              );
            })
          ) : (
            <div
              style={{
                color: "#9a9a9a",
                textAlign: "center",
                paddingTop: "30px",
              }}
            >
              {t("groupRole.pop-create.step.2.selectClusters.placeholder")}
            </div>
          )}
        </div>
        {/* <p>Select Role</p> */}
        <Paper>
          {this.state.rows.length > 0 ? (
            [
              <Grid rows={this.state.rows} columns={this.state.columns}>
                {/* <Toolbar /> */}
                {/* 검색 */}
                {/* <SearchState defaultValue="" />
            <SearchPanel style={{ marginLeft: 0 }} /> */}

                {/* Sorting */}
                <SortingState
                  defaultSorting={[{ columnName: "status", direction: "asc" }]}
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
                <Table cellComponent={Cell} />
                <TableColumnResizing
                  defaultColumnWidths={this.state.defaultColumnWidths}
                />
                <TableHeaderRow showSortingControls rowComponent={HeaderRow} />
                <TableColumnVisibility
                // defaultHiddenColumnNames={['role_id']}
                />
                <TableSelection selectByRowClick highlightRow />
              </Grid>
            ]
          ) : (
            <CircularProgress
              variant="determinate"
              value={this.state.completed}
              style={{ position: "absolute", left: "50%", marginTop: "20px" }}
            ></CircularProgress>
          )}
        </Paper>
      </div>
    );
  }
}

export default withTranslation()(CreateOmcpDeployment);

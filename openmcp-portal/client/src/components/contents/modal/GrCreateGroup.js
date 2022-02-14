import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
// import SelectBox from "../../modules/SelectBox";
import * as utilLog from "../../util/UtLogs.js";
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
import axios from "axios";
import LensIcon from "@material-ui/icons/Lens";

import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { fn_goLoginPage, fn_tokenValid } from "../../util/Utility.js";
import { withTranslation } from "react-i18next";
// import Typography from "@material-ui/core/Typography";
// import DialogActions from "@material-ui/core/DialogActions";
// import DialogContent from "@material-ui/core/DialogContent";
// import Button from "@material-ui/core/Button";
// import Dialog from "@material-ui/core/Dialog";
// import IconButton from "@material-ui/core/IconButton";
// import axios from 'axios';
// import { ContactlessOutlined } from "@material-ui/icons";

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

class GrCreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: "",
      description: "",
      open: false,

      rows: [],

      selectedRoleIds: [],
      roleSelectionId: [],

      selectedUserIds: [],
      userSelectionId: [],

      selectedClusters: [],
      clusterSelectionId: [],

      activeStep: 0,
    };
    // this.onChange = this.onChange.bind(this);
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  componentWillMount() {}

  handleClickOpen = () => {
    this.setState({
      open: true,
      roleSelection: [],
    });
  };

  handleClose = () => {
    this.setState({
      groupName: "",
      description: "",
      rows: [],
      selectedRoleIds: [],
      roleSelectionId: [],
      selectedUserIds: [],
      userSelectionId: [],
      activeStep: 0,
      open: false,
    });
    this.props.menuClose();
  };

  handleSave = (e) => {
    const { t } = this.props;
    if (this.state.groupName === "") {
      alert(t("groupRole.pop-create.msg.chk-groupName"));
      return;
    } else if (this.state.description === "") {
      alert(t("groupRole.pop-create.msg.chk-description"));
      return;
    }
    //  else if (Object.keys(this.state.selectedRoleIds).length === 0) {
    //   alert("Please select roles");
    //   return;
    // }
    else if (Object.keys(this.state.selectedClusters).length === 0) {
      alert(t("groupRole.pop-create.msg.chk-clusters"));
      return;
    } else if (Object.keys(this.state.selectedUserIds).length === 0) {
      alert(t("groupRole.pop-create.msg.chk-users"));
      return;
    }

    // Update user role
    const url = `/settings/group-role`;
    const data = {
      groupName: this.state.groupName,
      description: this.state.description,
      // role_id:this.state.selectedRoleIds,
      user_id: this.state.selectedUserIds,
      clusters: this.state.selectedClusters,
    };
    axios
      .post(url, data)
      .then((res) => {
        // alert(res.data.message);
        this.setState({ open: false });
        this.props.menuClose();
        this.props.onUpdateData();

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-GR-EX01");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {
          if (result === "true") alert(err);
        });
      });

    //close modal popup
    this.setState({ open: false });
  };

  // onSelectRoles = (rows, selectionId) => {
  //   let roleIds = [];
  //   rows.forEach((role) => {
  //     roleIds.push(role.role_id);
  //   });

  //   this.setState({
  //     selectedRoleIds : roleIds,
  //     roleSelectionId : selectionId
  //   })
  // }

  onSelectUsers = (rows, selectionId) => {
    let userIds = [];
    rows.forEach((user) => {
      userIds.push(user.user_id);
    });

    this.setState({
      selectedUserIds: userIds,
      userSelectionId: selectionId,
    });
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
      t("groupRole.pop-create.step.1.title"),
      t("groupRole.pop-create.step.2.title"),
      t("groupRole.pop-create.step.3.title"),
    ];
    // const steps = ['Set Group Informations', 'Select Group Roles','Select Projects', 'Select Group Users'];
    const handleNext = () => {
      switch (this.state.activeStep) {
        case 0:
          if (this.state.groupName === "") {
            alert(t("groupRole.pop-create.msg.chk-groupName"));
            return;
          } else if (this.state.description === "") {
            alert(t("groupRole.pop-create.msg.chk-description"));
            return;
          } else {
            this.setState({ activeStep: this.state.activeStep + 1 });
            return;
          }
        // case 1:
        //   if (Object.keys(this.state.selectedRoleIds).length === 0) {
        //     alert("Please select roles");
        //     return;
        //   } else {
        //     this.setState({activeStep : this.state.activeStep + 1});
        //     return;
        //   }
        case 1:
          if (Object.keys(this.state.selectedClusters).length === 0) {
            alert(t("groupRole.pop-create.msg.chk-clusters"));
            return;
          } else {
            this.setState({ activeStep: this.state.activeStep + 1 });
            return;
          }
        default:
          return;
      }
    };

    const handleBack = () => {
      this.setState({ activeStep: this.state.activeStep - 1 });
    };
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
          {t("groupRole.pop-create.btn-create")}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("groupRole.pop-create.title")}
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
                    <div>
                      <section className="md-content">
                        <p>
                          {t("groupRole.pop-create.step.1.groupRoleName.title")}
                        </p>
                        <TextField
                          id="outlined-multiline-static"
                          rows={1}
                          placeholder={t(
                            "groupRole.pop-create.step.1.groupRoleName.placeholder"
                          )}
                          variant="outlined"
                          value={this.state.groupName}
                          fullWidth={true}
                          name="groupName"
                          onChange={this.onChange}
                        />
                      </section>
                      <section className="md-content">
                        <p>
                          {t("groupRole.pop-create.step.1.description.title")}
                        </p>
                        <TextField
                          id="outlined-multiline-static"
                          rows={1}
                          placeholder={t(
                            "groupRole.pop-create.step.1.description.placeholder"
                          )}
                          variant="outlined"
                          value={this.state.description}
                          fullWidth={true}
                          name="description"
                          onChange={this.onChange}
                        />
                      </section>
                    </div>
                  ) : // this.state.activeStep === 1 ? (
                  //   <section className="md-content">
                  //     <GrRoles
                  //       selection={this.state.roleSelectionId}
                  //       onSelectedRoles={this.onSelectRoles}
                  //     />
                  //   </section>
                  // ) :

                  this.state.activeStep === 1 ? (
                    <section className="md-content">
                      <GrClusters
                        selection={this.state.clusterSelectionId}
                        onselectedClusters={this.onSelectClusters}
                        propsData={this.props.propsData}
                        t={t}
                      />
                    </section>
                  ) : (
                    <section className="md-content">
                      <GrUsers
                        selection={this.state.userSelectionId}
                        onSelectedUsers={this.onSelectUsers}
                        t={t}
                      />
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
                onClick={handleBack}
              >
                {t("common.btn.back")}
              </Button>
              {this.state.activeStep === steps.length - 1 ? (
                <Button onClick={this.handleSave} color="primary">
                  {t("common.btn.save")}
                </Button>
              ) : (
                <Button color="primary" onClick={handleNext}>
                  {t("common.btn.next")}
                </Button>
              )}
            </div>
            {/* <Button onClick={this.handleSave} color="primary">
              save
            </Button> */}
            <Button onClick={this.handleClose} color="primary">
              cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

// class GrRoles extends Component{
//   constructor(props){
//     super(props);
//     this.state = {
//       columns: [
//         { name: "role_name", title: "Role" },
//         { name: "description", title: "Description" },
//         { name: "role_id", title: "Role id" },
//       ],
//       defaultColumnWidths: [
//         { columnName: "role_name", width: 200 },
//         { columnName: "description", width: 480 },
//         { columnName: "role_id", width: 0 },
//       ],
//       currentPage: 0,
//       setCurrentPage: 0,
//       pageSize: 5,
//       pageSizes: [5, 10, 15, 0],
//       rows:[],
//       selection: this.props.selection,
//       selectedRow : [],
//     }
//   }

//   callApi = async () => {
//     const response = await fetch("/account-roles");
//     const body = await response.json();
//     return body;
//   };

//   componentWillMount(){
//     this.callApi()
//     .then((res) => {
//       this.setState({ rows: res});
//       let selectedRows = [];
//       this.props.selection.forEach((id) => {
//         selectedRows.push(res[id]);
//       });
//       this.setState({ selectedRow: selectedRows});
//       })
//       .catch((err) => console.log(err));
//   }

//   render(){
//     const HeaderRow = ({ row, ...restProps }) => (
//       <Table.Row
//         {...restProps}
//         style={{
//           cursor: "pointer",
//           backgroundColor: "whitesmoke",
//           // ...styles[row.sector.toLowerCase()],
//         }}
//         // onClick={()=> alert(JSON.stringify(row))}
//       />
//     );

//     const onSelectionChange = (selection) => {
//       let selectedRows = [];
//       selection.forEach((id) => {
//         selectedRows.push(this.state.rows[id]);
//       });
//       this.setState({ selectedRow: selectedRows});
//       this.setState({ selection: selection });

//       this.props.onSelectedRoles(selectedRows, selection);
//     };

//     return(
//       <div>
//         <p>Select Group Roles</p>
//           <div id="md-content-info" style={{display:"block", minHeight:"95px",marginBottom:"10px"}}>
//               {this.state.selectedRow.length > 0
//                 ? this.state.selectedRow.map((row)=>{
//                   return (
//                     <span>
//                       <LensIcon style={{fontSize:"8px", marginRight:"5px"}}/>
//                       {row.role_name}
//                     </span>
//                   );
//                 })
//                 : <div style={{
//                   color:"#9a9a9a",
//                   textAlign: "center",
//                   paddingTop: "30px"}}>
//                     Please Select Roles
//                   </div>}
//           </div>
//         {/* <p>Select Role</p> */}
//         <Paper>
//           <Grid rows={this.state.rows} columns={this.state.columns}>
//             {/* <Toolbar /> */}
//             {/* 검색 */}
//             {/* <SearchState defaultValue="" />
//             <SearchPanel style={{ marginLeft: 0 }} /> */}

//             {/* Sorting */}
//             <SortingState
//               defaultSorting={[{ columnName: "status", direction: "asc" }]}
//             />

//             {/* 페이징 */}
//             <PagingState
//               defaultCurrentPage={0}
//               defaultPageSize={this.state.pageSize}
//             />
//             <PagingPanel pageSizes={this.state.pageSizes} />
//             <SelectionState
//               selection={this.state.selection}
//               onSelectionChange={onSelectionChange}
//             />

//             <IntegratedFiltering />
//             <IntegratedSorting />
//             <IntegratedSelection />
//             <IntegratedPaging />

//             {/* 테이블 */}
//             <Table />
//             <TableColumnResizing
//               defaultColumnWidths={this.state.defaultColumnWidths}
//             />
//             <TableHeaderRow
//               showSortingControls
//               rowComponent={HeaderRow}
//             />
//             <TableColumnVisibility
//               defaultHiddenColumnNames={['role_id']}
//             />
//             <TableSelection
//               selectByRowClick
//               highlightRow
//             />
//           </Grid>
//         </Paper>
//       </div>
//     );
//   }
// }

class GrClusters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "name", title: "Name" },
        { name: "status", title: "Status" },
        { name: "nodes", title: "nodes" },
        { name: "cpu", title: "CPU(%)" },
        { name: "ram", title: "Memory(%)" },

        // { name: "edit", title: "edit" },
      ],
      defaultColumnWidths: [
        { columnName: "name", width: 180 },
        { columnName: "status", width: 130 },
        { columnName: "nodes", width: 100 },
        { columnName: "cpu", width: 100 },
        { columnName: "ram", width: 120 },
        // { columnName: "edit", width: 170 },
      ],
      rows: [],

      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],

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
            console.log("expired-pront");
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
      // console.log(cpuPct, memPct)
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
      this.setState({ selectedRow: selectedRows });
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
      </div>
    );
  }
}

class GrUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "user_id", title: "User ID" },
        { name: "role", title: "Roles" },
      ],
      defaultColumnWidths: [
        { columnName: "user_id", width: 200 },
        { columnName: "role", width: 500 },
      ],
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],
      rows: [],
      selection: this.props.selection,
      selectedRow: [],
    };
  }

  callApi = async () => {
    const response = await fetch("/settings/accounts");
    const body = await response.json();
    return body;
  };

  componentWillMount() {
    this.callApi()
      .then((res) => {
        this.setState({ rows: res });
        let selectedRows = [];
        this.props.selection.forEach((index) => {
          selectedRows.push(res[index]);
        });
        this.setState({ selectedRow: selectedRows });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const t = this.props.t;
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
      this.setState({ selectedRow: selectedRows });
      this.setState({ selection: selection });

      this.props.onSelectedUsers(selectedRows, selection);
    };

    return (
      <div>
        <p>{t("groupRole.pop-create.step.3.selectUsers.title")}</p>
        <div
          id="md-content-info"
          style={{ display: "block", minHeight: "95px", marginBottom: "10px" }}
        >
          {this.state.selectedRow.length > 0 ? (
            this.state.selectedRow.map((row) => {
              return (
                <span>
                  <LensIcon style={{ fontSize: "8px", marginRight: "5px" }} />
                  {row.user_id}
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
              {t("groupRole.pop-create.step.3.selectUsers.placeholder")}
            </div>
          )}
        </div>
        {/* <p>Select Role</p> */}
        <Paper>
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
            <Table />
            <TableColumnResizing
              defaultColumnWidths={this.state.defaultColumnWidths}
            />
            <TableHeaderRow showSortingControls rowComponent={HeaderRow} />
            <TableColumnVisibility defaultHiddenColumnNames={["role_id"]} />
            <TableSelection selectByRowClick highlightRow />
          </Grid>
        </Paper>
      </div>
    );
  }
}

export default withTranslation()(GrCreateGroup);

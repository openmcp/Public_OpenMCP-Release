import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
// import SelectBox from "../../modules/SelectBox";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  // SearchState,
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
  // Toolbar,
  // SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
  // TableEditRow,
  // TableEditColumn,
  TableSelection,
} from "@devexpress/dx-react-grid-material-ui";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
// import DialogContent from "@material-ui/core/DialogContent";
// import Button from "@material-ui/core/Button";
// import Dialog from "@material-ui/core/Dialog";
// import IconButton from "@material-ui/core/IconButton";
// import axios from 'axios';
// import { ContactlessOutlined } from "@material-ui/icons";
import { fn_goLoginPage, fn_tokenValid } from "../../util/Utility.js";
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


// let project_description = "";
class PjCreateProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 180 },
        { columnName: "status", width: 130 },
        { columnName: "nodes", width: 100 },
        { columnName: "cpu", width: 100 },
        { columnName: "ram", width: 120 },
        // { columnName: "edit", width: 170 },
      ],

      clusters: [],
      selection: [],
      selectedRows: [],
      project_name: "",
      // project_description: "",
      open: false,
    };
    this.onChange = this.onChange.bind(this);
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRows: [],
      project_name: "",
      // project_description: "",
    });
  };

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

  componentWillMount() {
    // cluster list를 가져오는 api 호출
    // this.callApi()
    //   .then((res) => {
    //     this.setState({ clusters: res });
    //   })
    //   .catch((err) => console.log(err));
  }

  onChange(e) {
    if (e.target.name === "project_name") {
      this.setState({
        project_name : e.target.value
      });
    }
  }

  handleClickOpen = () => {
    this.initState();
    this.setState({ open: true });
    this.callApi()
      .then( async (res) => {
        if(res === null){
          this.setState({ clusters: [] });
        } else {
          let result = await fn_tokenValid(res);
          if(result === "valid"){
            this.setState({ clusters: res });
          } else if (result === "refresh"){
            this.onRefresh();
          } else {
            console.log("expired-pront");
            fn_goLoginPage(this.props.propsData.info.history);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  handleClose = () => {
    this.initState();
    this.setState({ open: false });
    this.props.menuClose();
  };

  handleSave = (e) => {
    //Save Changed Taint
    const {t} = this.props;
    if (this.state.project_name === "") {
      alert(t("projects.pop-create.msg.chk-proejctName"));
      return;
    } else if (Object.keys(this.state.selectedRows).length === 0) {
      alert(t("common.msg.unselected-target"));
      return;
    }
    
    const url = `/projects/create`;
    const data = {
      project: this.state.project_name,
      clusters: this.state.selectedRows,
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
        utilLog.fn_insertPLogs(userId, "log-PJ-EX01");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });

    this.handleClose();
    // this.setState({ open: false });
    // console.log(this.state.key, this.state.value, this.state.taint)
  };

  
  onRefresh = () => {
    this.callApi()
    .then(async (res) => {
      if(res === null){
        this.setState({ clusters: [] });
      } else {
        this.setState({ clusters: res });
      }
    })
    .catch((err) => console.log(err));
  };


  onSelectionChange = (selection) => {
    this.setState({ selection: selection });
    this.setState({
      selectedRows:
        selection.length > 0
          ? this.state.clusters.filter((object, index) =>
              selection.includes(index)
            )
          : [],
    });
  };

  HeaderRow = ({ row, ...restProps }) => (
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

  render() {
    const {t} = this.props;
    const columns= [
      { name: "name", title: t("projects.pop-create.cluster.grid.name") },
      { name: "status", title: t("projects.pop-create.cluster.grid.status") },
      { name: "nodes", title: t("projects.pop-create.cluster.grid.nodes") },
      { name: "cpu", title: t("projects.pop-create.cluster.grid.cpu") },
      { name: "ram", title: t("projects.pop-create.cluster.grid.ram") },

      // { name: "edit", title: "edit" },
    ];
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

    return (
      <div>
        <div
          // variant="outlined"
          // color="primary"
          onClick={this.handleClickOpen}
          style={{
            // position: "absolute",
            // right: "26px",
            // top: "26px",
            zIndex: "10",
            width: "148px",
            // height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t("projects.pop-create.title")}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("projects.pop-create.title")}
          </DialogTitle>
          <DialogContent dividers>
            {/* <div className="pj-create">
              <div className="create-content"> */}
            <div className="md-contents-body">
              <section className="md-content">
                <p>{t("projects.pop-create.project.title")}</p>
                <div style={{ marginBottom: "10px" }}>
                  <TextField
                    id="outlined-multiline-static"
                    // label="name"
                    rows={1}
                    placeholder={t("projects.pop-create.project.placeHolder")}
                    variant="outlined"
                    value = {this.state.project_name}
                    fullWidth={true}
                    name="project_name"
                    onChange={this.onChange}
                  />
                </div>
                {/* <div style={{ marginBottom: "10px" }}>
                  <TextField
                    id="outlined-multiline-static"
                    // label="decription"
                    multiline
                    rows={2}
                    placeholder="project description"
                    variant="outlined"
                    name="project_description"
                    onChange={this.onChange}
                    // value = {this.state.project_description}
                    fullWidth={true}
                  />
                </div> */}
              </section>
              <section className="md-content">
                <p>{t("projects.pop-create.cluster.title")}</p>
                {/* cluster selector */}
                <Paper>
                  <Grid rows={this.state.clusters} columns={columns}>
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
                      onSelectionChange={this.onSelectionChange}
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
                      rowComponent={this.HeaderRow}
                    />
                    <TableSelection
                      selectByRowClick
                      highlightRow
                      // showSelectionColumn={false}
                    />
                  </Grid>
                </Paper>
              </section>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSave} color="primary">
              {t("common.btn.save")}
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

export default withTranslation()(PjCreateProject); 

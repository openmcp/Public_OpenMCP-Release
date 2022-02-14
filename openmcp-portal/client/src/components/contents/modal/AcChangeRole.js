import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
// import SelectBox from "../../modules/SelectBox";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from 'AsyncStorage';
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import {
  Button,
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
import axios from 'axios';
// import Typography from "@material-ui/core/Typography";
// import DialogActions from "@material-ui/core/DialogActions";
// import DialogContent from "@material-ui/core/DialogContent";
// import Button from "@material-ui/core/Button";
// import Dialog from "@material-ui/core/Dialog";
// import IconButton from "@material-ui/core/IconButton";
// import axios from 'axios';
// import { ContactlessOutlined } from "@material-ui/icons";
import { withTranslation } from 'react-i18next'

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

class AcChangeRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { name: "role_name", title: "Role" },
        { name: "description", title: "Description" },
        { name: "role_id", title: "Role id" },

        
        // { name: "edit", title: "edit" },
      ],
      defaultColumnWidths: [
        { columnName: "role_name", width: 200 },
        { columnName: "description", width: 480 },
        { columnName: "role_id", width: 200 },
        // { columnName: "edit", width: 170 },
      ],
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15, 0],

      open: false,
      account : "",
      account_role : "",
      rows : [],

      selection: [],
      selectedRow : "",
    };
    // this.onChange = this.onChange.bind(this);
  }

  callApi = async () => {
    const response = await fetch("/account-roles");
    const body = await response.json();
    return body;
  };

  componentWillMount() {
    // console.log("Migration will mount");
    // cluster list를 가져오는 api 호출
    // this.callApi()
    //   .then((res) => {
    //     this.setState({ rows: res });
    //     // console.log(res[0])
    //     // this.setState({ cluster: res[0], firstValue: res[0] });
    //   })
    //   .catch((err) => console.log(err));
  }

  // onChange(e) {
  //   console.log("onChangedd");
  //   this.setState({
  //     [e.target.name]: e.target.value,
  //   });
  // }

  handleClickOpen = () => {
    const {t} = this.props;
    if (Object.keys(this.props.rowData).length === 0) {
      alert(t("accounts.account.pop-changeRole.msg.chk-selectAccount"));
      this.setState({ open: false });
      return;
    }
    
    this.setState({ 
      open: true,
      account : this.props.rowData.user_id,
      account_role : this.props.rowData.role,
      selection : []
    });

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

  handleClose = () => {
    this.setState({
      account: "",
      role_id: "",
      open: false,
    });
    this.props.menuClose();
  };

  handleSave = (e) => {
    const {t} = this.props;
    if (Object.keys(this.state.selectedRow).length === 0) {
      alert(t("accounts.account.pop-changeRole.msg.chk-selectRole"));
      return;
    } 

    // Update user role
    const url = `/update/account-roles`;
      const data = {
        userid:this.state.account,
        role:this.state.selectedRow.role_id,
      };
      axios.put(url, data)
      .then((res) => {
          // alert(res.data.message);
          this.setState({ open: false });
          this.props.onUpdateData();
          let userId = null;
          AsyncStorage.getItem("userName",(err, result) => { 
            userId= result;
          })
          utilLog.fn_insertPLogs(userId, "log-AC-EX02");
      })
      .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });



    //close modal popup
    this.setState({ open: false });
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
      // console.log(selection);
      if (selection.length > 1) selection.splice(0, 1);
      this.setState({ selection: selection });
      this.setState({ selectedRow: this.state.rows[selection[0]] ? this.state.rows[selection[0]] : {} });
    };

    return (
      <div>
        <div
          // variant="outlined"
          // color="primary"
          onClick={this.handleClickOpen}
          style={{
            // position: "absolute",
            // right: "215px",
            // top: "26px",
            zIndex: "10",
            width: "148px",
            textTransform: "capitalize",
          }}
        >
          {t("accounts.account.pop-changeRole.btn-change")}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("accounts.account.pop-changeRole.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="md-contents-body">
              <section className="md-content">
                {/* deployment informations */}
                <p>{t("accounts.account.pop-changeRole.userInfo.title")}</p>
                <div id="md-content-info">
                  <div class="md-partition">
                    <div class="md-item">
                      <span><strong>UserID : </strong></span>
                      <span>{this.state.account}</span>
                    </div>
                  </div>
                  <div class="md-partition">
                    <div class="md-item">
                      <span><strong>Current Role : </strong></span>
                      <span>{this.state.account_role}</span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="md-content">
                <p>{t("accounts.account.pop-changeRole.selectRole.title")}</p>
                {/* cluster selector */}
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
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                  <TableColumnVisibility
                    defaultHiddenColumnNames={['role_id']}
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
              {t("common.btn.update")}
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

export default withTranslation()(AcChangeRole); 
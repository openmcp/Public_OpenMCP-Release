import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
// import SelectBox from "../../modules/SelectBox";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  TextField,
} from "@material-ui/core";

// import Paper from "@material-ui/core/Paper";
import axios from "axios";
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

class ThEditThreshold extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cluster:"",
      node:"",
      cpuWarn: 0,
      cpuDanger: 0,
      ramWarn: 0,
      ramDanger: 0,
      storageWarn: 0,
      storageDanger: 0,
      open: false,
    };
  }
  componentWillMount() {}

  onChange = (e) =>{
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleClickOpen = () => {
    const {t} = this.props;
    if (Object.keys(this.props.rowData).length === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-selectThreshold"));
      this.setState({ open: false });
      return;
    }

    this.setState({
      cluster :this.props.rowData.cluster_name,
      node:this.props.rowData.node_name,
      cpuWarn: this.props.rowData.cpu_warn,
      cpuDanger: this.props.rowData.cpu_danger,
      ramWarn: this.props.rowData.ram_warn,
      ramDanger: this.props.rowData.ram_danger,
      storageWarn: this.props.rowData.storage_warn,
      storageDanger: this.props.rowData.storage_danger,
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      cluster :"",
      node:"",
      cpuWarn: 0,
      cpuDanger: 0,
      ramWarn: 0,
      ramDanger: 0,
      storageWarn: 0,
      storageDanger: 0,
      rows: [],
      
      open: false,
    });
   
    this.props.menuClose();
  };

  handleUpdate = (e) => {
    const {t} = this.props;

    if (this.state.cpuWarn === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-cpuW"));
      return;
    } else if (this.state.cpuDanger === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-cpuD"));
      return;
    } else if (this.state.ramWarn === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-memoryW"));
      return;
    } else if (this.state.ramDanger === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-memoryD"));
      return;
    } else if (this.state.stroageWarn === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-storageW"));
      return;
    } else if (this.state.stroageDanger === 0) {
      alert(t("alert.threshold.pop-edit.msg.chk-storageD"));
      return;
    }

    // Update user role
    const url = `/settings/threshold`;
    const data = {
      clusterName : this.state.cluster,
      nodeName : this.state.node,
      cpuWarn: this.state.cpuWarn,
      cpuDanger: this.state.cpuDanger,
      ramWarn: this.state.ramWarn,
      ramDanger: this.state.ramDanger,
      storageWarn: this.state.storageWarn,
      storageDanger: this.state.storageDanger,
    };
    axios
      .put(url, data)
      .then((res) => {
        // alert(res.data.message);
        this.setState({ open: false });
        this.props.menuClose();
        this.props.onUpdateData();

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-AL-EX02");
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
          {t("alert.threshold.pop-edit.btn-edit")}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="md"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("alert.threshold.pop-edit.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="md-contents-body small-grid">
              <div>
                <Typography>
                  <div>
                    <section className="md-content">
                      <div style={{ display: "flex", marginTop: "10px" }}>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%", marginRight: "10px" }}
                        >
                          <p>{t("alert.threshold.pop-edit.cpuThW")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.cpuWarn}
                            fullWidth={true}
                            name="cpuWarn"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%" }}
                        >
                          <p>{t("alert.threshold.pop-edit.cpuThD")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.cpuDanger}
                            fullWidth={true}
                            name="cpuDanger"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                      </div>
                    </section>
                    <section className="md-content">
                      <div style={{ display: "flex", marginTop: "10px" }}>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%", marginRight: "10px" }}
                        >
                          <p>{t("alert.threshold.pop-edit.memoryThW")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.ramWarn}
                            fullWidth={true}
                            name="ramWarn"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%" }}
                        >
                          <p>{t("alert.threshold.pop-edit.memoryThD")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.ramDanger}
                            fullWidth={true}
                            name="ramDanger"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                      </div>
                    </section>
                    <section className="md-content">
                      <div style={{ display: "flex", marginTop: "10px" }}>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%", marginRight: "10px" }}
                        >
                          <p>{t("alert.threshold.pop-edit.storageThW")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.storageWarn}
                            fullWidth={true}
                            name="storageWarn"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                        <div
                          className="props pj-pc-textfield"
                          style={{ width: "50%" }}
                        >
                          <p>{t("alert.threshold.pop-edit.storageThD")}</p>
                          <TextField
                            id="outlined-multiline-static"
                            rows={1}
                            type="number"
                            placeholder="threshold rate"
                            variant="outlined"
                            value={this.state.storageDanger}
                            fullWidth={true}
                            name="storageDanger"
                            onChange={this.onChange}
                          />
                          <span style={{ bottom: "8px" }}>%</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </Typography>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <div>
              <Button onClick={this.handleUpdate} color="primary">
                {t("common.btn.update")}
              </Button>
            </div>
            <Button onClick={this.handleClose} color="primary">
              {t("common.btn.cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withTranslation()(ThEditThreshold); 
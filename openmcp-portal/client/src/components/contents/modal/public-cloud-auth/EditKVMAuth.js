import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { TextField } from "@material-ui/core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import axios from "axios";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from 'AsyncStorage';
// import Confirm2 from "../../../modules/Confirm2";
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

class EditKVMAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      seq: "",
      cluster : "",
      agentURL : "",
      agentPort : "",
      mClusterName : "",
      mClusterPwd : "",
    };
  }

  componentWillMount() {
    
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.props.open !== prevProps.open) {
      if(this.props.new === false){
        this.setState({
          ...this.state,
          open: this.props.open,
          seq : this.props.data.seq,
          cluster : this.props.data.cluster,
          agentURL : this.props.data.agentURL,
          agentPort : this.props.data.agentPort,
          mClusterName : this.props.data.mClusterName,
          mClusterPwd : this.props.data.mClusterPwd,
        });
      } else {
        this.setState({
          ...this.state,
          open: this.props.open,
          cluster : "",
          agentURL : "",
          agentPort : "",
          mClusterName : "",
          mClusterPwd : "",
        });
      }
    }
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleClose = () => {
    this.props.callBackClosed()
  };

  handleSave = (e) => {
    const {t} = this.props;
    if (this.state.cluster === ""){
      alert(t("config.publicCloudAuth.kvm.pop-common.msg.chk-cluster"));
      return;
    } else if (this.state.agentURL === ""){
      alert(t("config.publicCloudAuth.kvm.pop-common.msg.chk-kvmAgentUrl"));
      return;
    } else if (this.state.agentPort === ""){
      alert(t("config.publicCloudAuth.kvm.pop-common.msg.chk-kvmAgentPort"));
      return;
    } else if (this.state.mClusterName === ""){
      alert(t("config.publicCloudAuth.kvm.pop-common.msg.chk-masterVmName"));
      return;
    } else if (this.state.mClusterPwd === ""){
      alert(t("config.publicCloudAuth.kvm.pop-common.msg.chk-masterVmPwd"));
      return;
    } 

    //post 호출
    const url = `/settings/config/pca/kvm`;
    if(this.props.new){
      const data = {
        seq : this.state.seq,
        cluster : this.state.cluster,
        agentURL : this.state.agentURL,
        agentPort : this.state.agentPort,
        mClusterName : this.state.mClusterName,
        mClusterPwd : this.state.mClusterPwd,
      };

      axios.post(url, data)
      .then((res) => {
        this.props.callBackClosed()
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX10");
      })
      .catch((err) => {
        //close modal popup
        console.log("Error : ",err);
      });
    } else {
      const data = {
        seq : this.props.data.seq,
        cluster : this.state.cluster,
        agentURL : this.state.agentURL,
        agentPort : this.state.agentPort,
        mClusterName : this.state.mClusterName,
        mClusterPwd : this.state.mClusterPwd,
      };

      axios.put(url, data)
      .then((res) => {
        this.props.callBackClosed()
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX11");
      })
      .catch((err) => {
        //close modal popup
        console.log("Error : ",err);
      });
    }

      

    // alert(this.state.cluster+","+ this.state.secretKey+","+this.state.accessKey)
  };

  callApi = async (uri) => {
    // const response = await fetch("/aws/clusters");
    const response = await fetch(uri);
    const body = await response.json();
    return body;
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
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth="lg"
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {this.props.title}
          </DialogTitle>
          <DialogContent dividers>
            <div className="md-contents-body" style={{minWidth:"500px"}}>
              <section className="md-content">
                <div className="props">
                  <p>{t("config.publicCloudAuth.kvm.pop-common.cluster")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="cluster name"
                    variant="outlined"
                    value={this.state.cluster}
                    fullWidth={true}
                    name="cluster"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.kvm.pop-common.kvmAgentUrl")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="kvm agent url"
                    variant="outlined"
                    value={this.state.agentURL}
                    fullWidth={true}
                    name="agentURL"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.kvm.pop-common.kvmAgentPort")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="kvm agent port"
                    variant="outlined"
                    value={this.state.agentPort}
                    fullWidth={true}
                    name="agentPort"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.kvm.pop-common.masterVmName")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="cluster master vm name"
                    variant="outlined"
                    value={this.state.mClusterName}
                    fullWidth={true}
                    name="mClusterName"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.kvm.pop-common.masterVmPwd")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="cluster master vm password"
                    variant="outlined"
                    value={this.state.mClusterPwd}
                    fullWidth={true}
                    name="mClusterPwd"
                    onChange={this.onChange}
                  />
                </div>
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

export default withTranslation()(EditKVMAuth); 
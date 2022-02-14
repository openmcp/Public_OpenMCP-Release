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

class EditAKSAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      seq: "",
      cluster : "",
      clientId:"",
      clientSec:"",
      tenantId:"",
      subId:"",
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
          clientId:this.props.data.clientId,
          clientSec:this.props.data.clientSec,
          tenantId:this.props.data.tenantId,
          subId:this.props.data.subId,
        });
      } else {
        this.setState({
          ...this.state,
          open: this.props.open,
          cluster : "",
          clientId:"",
          clientSec:"",
          tenantId:"",
          subId:"",
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
      alert(t("config.publicCloudAuth.aks.pop-common.msg.chk-cluster"));
      return;
    } else if (this.state.clientId === ""){
      alert(t("config.publicCloudAuth.aks.pop-common.msg.chk-clusterId"));
      return;
    } else if (this.state.clientSec === ""){
      alert(t("config.publicCloudAuth.aks.pop-common.msg.chk-clientSec"));
      return;
    } else if (this.state.tenantId === ""){
      alert(t("config.publicCloudAuth.aks.pop-common.msg.chk-tenantId"));
      return;
    } else if (this.state.subId === ""){
      alert(t("config.publicCloudAuth.aks.pop-common.msg.chk-subId"));
      return;
    } 

    //post 호출
    const url = `/settings/config/pca/aks`;
  
    if(this.props.new){
      const data = {
        cluster : this.state.cluster,
        clientId: this.state.clientId,
        clientSec: this.state.clientSec,
        tenantId: this.state.tenantId,
        subId: this.state.subId,
      };

      // clientID = "1edadbd7-d466-43b1-ad73-15a2ee9080ff"
      // clientSec = "07.Tx2r7GobBf.Suq7quNRhO_642z-p~6a"
      // tenantID = "bc231a1b-ab45-4865-bdba-7724c2893f1c"
      // subID := "dc80d3cf-4e1a-4b9a-8785-65c4b739e8d2"

      axios.post(url, data)
      .then((res) => {
        this.props.callBackClosed()
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX07");
      })
      .catch((err) => {
        //close modal popup
        console.log("Error : ",err);
      });
    } else {
      const data = {
        seq : this.props.data.seq,
        cluster : this.state.cluster,
        clientId: this.state.clientId,
        clientSec: this.state.clientSec,
        tenantId: this.state.tenantId,
        subId: this.state.subId,
      };

      axios.put(url, data)
      .then((res) => {
        this.props.callBackClosed()
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CF-EX08");
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
                  <p>{t("config.publicCloudAuth.aks.pop-common.cluster")}</p>
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
                  <p>{t("config.publicCloudAuth.aks.pop-common.clusterId")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="clientId"
                    variant="outlined"
                    value={this.state.clientId}
                    fullWidth={true}
                    name="clientId"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.aks.pop-common.clientSec")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="clientSec"
                    variant="outlined"
                    value={this.state.clientSec}
                    fullWidth={true}
                    name="clientSec"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.aks.pop-common.tenantId")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="tenant Id"
                    variant="outlined"
                    value={this.state.tenantId}
                    fullWidth={true}
                    name="tenantId"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props">
                  <p>{t("config.publicCloudAuth.aks.pop-common.subId")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder="sub Id"
                    variant="outlined"
                    value={this.state.subId}
                    fullWidth={true}
                    name="subId"
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

export default withTranslation()(EditAKSAuth); 
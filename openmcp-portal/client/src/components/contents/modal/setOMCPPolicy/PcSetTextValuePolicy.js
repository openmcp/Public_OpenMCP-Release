import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import Slider from "@material-ui/core/Slider";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
// import SelectBox from "../../../modules/SelectBox.js";
import { TextField } from "@material-ui/core";
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

class PcSetTextValuePolicy extends Component {
  constructor(props) {
    super(props);
    // this.g_rate_max = 10;
    // this.period_max = 10;
    this.state = {
      textValue:"",
      open: false,
      policyData: [],
    };
    // this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {}

  handleClickOpen = () => {
    if (Object.keys(this.props.policy).length === 0) {
      alert("Please Select Policy");
      this.setState({ open: false });
      return;
    }

    let policyData = [];
    this.props.policy.value
      .slice(0, -1)
      .split("|")
      .forEach((item) => {
        let itemSplit = item.split(" : ");
        policyData.push({
          key: itemSplit[0],
          value: itemSplit[1],
        });
      });

    this.setState({
      open: true,
      policyData: policyData,
      // textValue: policyData[0].value
    });
  };

  onChange = (e) => {
    // this.setState({
    //   // [e.target.name]: e.target.value,
    //   textValue: e.target.value,
    // });

    if(e.target.id !== ""){
      let tempData = this.state.policyData;
      tempData[0].value = e.target.value;

      this.setState({
        policyData: tempData,
      });
    }
  };



  handleClose = () => {
    this.setState({ open: false });
  };

  handleSave = (e) => {
    let valueData = [];
    this.state.policyData.forEach((item, index)=>{

      // {"op": "replace", "path": "/spec/template/spec/policies/0/value/0", "value": "Unequal"}

      let object = {
        op: "replace",
        path: "/spec/template/spec/policies/"+index.toString()+"/value/0",
        value: item.value.toString(),
      }

      valueData.push(object);
    })

    // Save modification data (Policy Changed)
    const url = `/settings/policy/openmcp-policy`;
    const data = {
      policyName: this.props.policyName,
      values: valueData,
    };
    axios
      .post(url, data)
      .then((res) => {
        if (res.data.length > 0) {
          if (res.data[0].code === 200) {
            this.props.onUpdateData();

            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });
            utilLog.fn_insertPLogs(userId, "log-PO-EX01");
          }
          // alert(res.data[0].text);
        }
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });
    this.setState({ open: false });
  };

  render() {
    const {t} = this.props;
    const DialogTitle = withStyles(styles)((props) => {
      const { children, classes, onClose, ...other } = props;
      return (
        <div>
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
        </div>
      );
    });


    return (
      <div>
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            position: "absolute",
            right: "26px",
            top: "26px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t("policy.omcpPolicy.pop-edit.btn-edit")}
        </Button>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {this.props.policyName}
          </DialogTitle>
          <DialogContent dividers>
            <div className="pd-resource-config select">
              {this.state.policyData.map((item, index) => {
                return (
                  <div className="res">
                    <Typography id="select-mode" gutterBottom>
                      {item.key}
                    </Typography>

                    <section className="md-content">
                      <TextField
                        id="outlined-multiline-static"
                        rows={1}
                        placeholder={item.key}
                        variant="outlined"
                        value={this.state.policyData[0].value}
                        fullWidth={true}
                        name={'textValue'+index.toString()}
                        onChange={this.onChange}
                      />
                    </section>
                  </div>
                );
              })}
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

export default withTranslation()(PcSetTextValuePolicy); 
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
import Slider from "@material-ui/core/Slider";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
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
class PcSetLoadbalancingControllerPolicy extends Component {
  constructor(props) {
    super(props);
    // this.g_rate_max = 10;
    // this.period_max = 10;
    this.state = {
      open: false,
      policyData: [],
      float_marks: [],
      int_marks : []
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    let marks=[];
    let step= 0.1;
    for (let i = 0; i <= 1; i = i + step) {
      if (i === 0 || i.toFixed(1) === "1.0") {
        marks.push({ value: i, label: i.toFixed(0) });
      } else {
        marks.push({
          value: i,
          label: step < 1 ? i.toFixed(1) : i.toString(),
        });
      }
    }
    
    let marks2=[];
    let step2= 5;
    for (let i = 0; i <= 100; i = i + step2) {
      marks2.push({ value: i, label: i.toString() });
    }

    this.setState({ float_marks: marks, int_marks: marks2 });
  }

  onChange(e, newValue) {
    if (e.target.id !== "") {
      let tempData = this.state.policyData;
      tempData[e.target.id].value = newValue;
    }
  }

  onTxtChange = (e) => {
    if(e.target.id !== ""){
      let tempData = this.state.policyData;
      tempData[e.target.id].value = e.target.value;

      this.setState({
        policyData: tempData,
      });
    }
  };

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
          value: parseFloat(itemSplit[1]),
        });
      });
    console.log(policyData);

    this.setState({
      open: true,
      policyData: policyData,
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSave = (e) => {
    let valueData = [];
    this.state.policyData.forEach((item, index) => {
      let object = {
        op: "replace",
        path: "/spec/template/spec/policies/" + index.toString() + "/value/0",
        value: item.value.toString(),
      };

      valueData.push(object);
    });

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
            <div className="pd-resource-config">
              {this.state.policyData.map((item, index) => {
                return (
                  <div className="res">
                    <Typography id="range-slider" gutterBottom>
                      {item.key}
                    </Typography>
                    {
                      item.key=== "GeoRate" ?
                        <Slider
                        id={index}
                        className="sl"
                        name="policyData"
                        defaultValue={item.value}
                        onChange={this.onChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        // getAriaValueText={valuetext}
                        step={null}
                        min={0}
                        max={1}
                        // marks={this.props.isFloat ? this.g_float_marks : this.g_int_marks}
                        marks={this.state.float_marks}
                      /> : item.key === "Period" ? 
                      <section className="md-content">
                        <TextField
                          id={index}
                          rows={1}
                          placeholder={item.key}
                          variant="outlined"
                          value={this.state.policyData[index].value}
                          fullWidth={true}
                          name={'textValue'+index.toString()}
                          onChange={this.onTxtChange}
                        />
                      </section>
                      : <Slider
                        id={index}
                        className="sl"
                        name="policyData"
                        defaultValue={item.value}
                        onChange={this.onChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        // getAriaValueText={valuetext}
                        step={null}
                        min={0}
                        max={100}
                        // marks={this.props.isFloat ? this.g_float_marks : this.g_int_marks}
                        marks={this.state.int_marks}
                      />
                    }
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


export default withTranslation()(PcSetLoadbalancingControllerPolicy); 
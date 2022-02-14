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
import SelectBox from "../../modules/SelectBox";
import * as utilLog from "../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
import Confirm2 from "../../modules/Confirm2";
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
});

class NdTaintConfig extends Component {
  constructor(props) {
    super(props);
    this.taint_list = ["NoSchedule", "PreferNoSchedule", "NoExecute"];
    this.state = {
      taints: this.props.taints,
      title: this.props.name,
      open: false,
      key: "",
      value: "",
      effect: "NoSchedule",
      confirmType: "",
      confirmOpen: false,
      confirmInfo: {
        title: 'Delete Taint',
        context: 'Are you sure Delete Taint',
        button: {
          open: "",
          yes: this.props.t("common.btn.confirm"),
          no: this.props.t("common.btn.cancel"),
        },
      },
      confrimTarget: "",
      confirmTargetKeyname: "",
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {}

  onChange(e) {
    // console.log("onChangedd");
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ 
      key: "",
      value: "",
      effect: "NoSchedule",
      open: false });
  };

  handleSave = (e) => {
    //Save Changed Taint
    if (this.state.key === "") {
      alert("Please enter taint key");
      return;
    } else if (this.state.value === "") {
      alert("Please enter taint value");
      return;
    } else if (this.state.effect === "") {
      alert("Please select taint effect");
      return;
    }

    // /apis/nodes/taint/add
    // todo 테인트 관련 API 호출필요
    // Taint 실행명령
    // kubectl taint nodes docker-for-desktop key01=value01:NoSchedule
    // Taint 삭제명령
    // kubectl taint nodes docker-for-desktop key01:NoSchedule-

    const url = `/apis/nodes/taint/add`;
    const data = {
      clusterName: this.props.cluster,
      nodeName: this.props.node,
      effect: this.state.effect,
      key: this.state.key,
      value: this.state.value,
    };
    axios
      .patch(url, data)
      .then((res) => {
        this.props.onUpdateData();
        // alert(res.data[0].text);

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-ND-EX08");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {
          if (result === "true") alert(err);
        });
      });
      this.handleClose();
  };

  handelDelete = (taint, index) => {
    this.setState({
      confirmOpen: true,
    })
  };

  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    let index = 0;
    const url = `/apis/nodes/taint/delete`;
    const data = {
      clusterName: this.props.cluster,
      nodeName: this.props.node,
      index: index.toString(),
    };

    if (result) {
      axios
        .patch(url, data)
        .then((res) => {
          if (res.data.error) {
            // alert(res.data.message);
          } else {
            this.props.onUpdateData();
            // alert(res.data[0].text);
          }
          let userId = null;
          AsyncStorage.getItem("userName", (err, result) => {
            userId = result;
          });
          utilLog.fn_insertPLogs(userId, "log-ND-EX09");
        })
        .catch((err) => {
          console.log(err);
        });
        this.handleClose();
    } 
  };

  onSelectBoxChange = (value) => {
    this.setState({ effect: value });
  };

  render() {
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

    const selectBoxData = [
      { name: "NoSchedule", value: "NoSchedule" },
      { name: "PreferNoSchedule", value: "PreferNoSchedule" },
      { name: "NoExecute", value: "NoExecute" },
    ];

    return (
      <div>
        {/* <div
          className="btn-join"
          onClick={this.handleClickOpen}
          style={{
            position: "absolute",
            right: "12px",
            top: "0px",
            zIndex: "10",
          }}
        >
          
        </div> */}
        <Confirm2
          confirmInfo={this.state.confirmInfo}
          confrimTarget={this.state.confrimTarget}
          confirmTargetKeyname={this.state.confirmTargetKeyname}
          confirmed={this.confirmed}
          confirmOpen={this.state.confirmOpen}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            position: "absolute",
            right: "0px",
            top: "0px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          config taint
        </Button>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            Taint
          </DialogTitle>
          <DialogContent dividers>
            <div className="nd-taint-config">
              {this.props.taints.length > 0
                ? 

                [
                  <div className="taint-title">Taint List</div>
                  ,
                  <div className="taint-list">
                    {
                      this.props.taints.map((taint, index) => {
                        return [
                          <div>
                            <label>key : </label>
                            <span>{taint.key}</span>
    
                            <label>value : </label>
                            <span>{taint.value}</span>
    
                            <label>effect : </label>
                            <span>{taint.effect}</span>
    
                            <Button
                            className = "taint-delete"
                              onClick={() => this.handelDelete(taint, index)}
                              color="primary"
                            >
                              delete
                            </Button>
                          </div>
                        ]})
                    }
                  </div>
                ]


                : null}

              <div className="taint-title">Add Taint</div>
              <div className="taint">
                <input
                  type="text"
                  value={this.state.key}
                  placeholder="key"
                  name="key"
                  onChange={this.onChange}
                />
                <input
                  type="text"
                  value={this.state.value}
                  placeholder="value"
                  name="value"
                  onChange={this.onChange}
                />

                <SelectBox
                  className="selectbox"
                  rows={selectBoxData}
                  onSelectBoxChange={this.onSelectBoxChange}
                  defaultValue={this.state.effect}
                ></SelectBox>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSave} color="primary">
              save
            </Button>
            <Button onClick={this.handleClose} color="primary">
              cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default NdTaintConfig;

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
import * as utilLog from "./../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
import { withTranslation } from 'react-i18next';
// import axios from 'axios';

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

class MtAddRegionCost extends Component {
  constructor(props) {
    super(props);
    this.cpu_max = 5000;
    this.memory_max = 10000;
    this.state = {
      title: this.props.name,
      open: false,
      regionCode: "",
      regionName: "",
      resgionCost: 0,
    };
  }
  componentWillMount() {}

  onChange = (e)=>{
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSave = (e) => {
    if (this.state.regionCode === "") {
      alert("Please enter Code");
      return;
    } else if (this.state.regionName === "") {
      alert("Please enter Name");
      return;
    } else if (this.state.resgionCost === "") {
      alert("Please enter Cost");
      return;
    }

    //post 호출
    const url = `/apis/metering`;

    const data = {
      regionCode: this.state.regionCode,
      regionName: this.state.regionName,
      regionCost: this.state.regionCost,
    };

    axios
      .post(url, data)
      .then((res) => {
        this.props.onUpdateData();

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-MR-EX01");
      })
      .catch((err) => {
        console.log("Error : ", err);
      });

    this.setState({ open: false });
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
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            position: "absolute",
            right: "160px",
            top: "2px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
         {t("meterings.pop-add.btn-add")}
        </Button>

        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
          {t("meterings.pop-add.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="mt-set-metering">
              <div className="res">
                <Typography id="range-slider" gutterBottom>
                {t("meterings.pop-add.title")}
                </Typography>
                <div className="txt">
                  <span>Code : </span>
                  <div className="input-txt">
                    <input type="text" placeholder="KR" name="regionCode" 
                    onChange={this.onChange} />
                  </div>
                </div>
                <div className="txt">
                  <span>Name : </span>
                  <div className="input-txt">
                    <input type="text" placeholder="Korea" name="regionName" 
                    onChange={this.onChange} />
                  </div>
                </div>
                <div className="txt">
                  <span>Cost : </span>
                  <div className="input-txt">
                    <input
                      type="number"
                      placeholder="0"
                      name="regionCost"
                      style={{ textAlign: "right", padding: "0" }}
                      onChange={this.onChange} 
                    />
                  </div>
                  <span className="per">$</span>
                </div>
                  <div className="per">
{t("meterings.pop-add.costDescription")}</div>
              </div>
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

export default withTranslation()(MtAddRegionCost)
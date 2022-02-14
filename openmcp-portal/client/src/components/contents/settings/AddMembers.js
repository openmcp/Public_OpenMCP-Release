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
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import { AsyncStorage } from "AsyncStorage";
import * as utilLog from "../../util/UtLogs.js";

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

class AddMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: "",
      password: "",
      retype_password: "",
      open: false,
    };
    this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount() {
  }

  onChanged(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
    this.props.menuClose();
  };

  handleRegister = (e) => {
    e.preventDefault();
    const { password, retype_password } = this.state;
    if (password !== retype_password) {
      alert("Password confirmation does not match");
    } else {
      const url = `/create_account`;
      const data = {
        userid:this.state.userid,
        password:this.state.password,
        role:"{user}",
      };
      axios.post(url, data)
      .then((res) => {
          // alert(res.data.message);
          this.setState({ open: false });
          this.props.onUpdateData();

          let userId = null;
          AsyncStorage.getItem("userName",(err, result) => { 
            userId= result;
          })
          utilLog.fn_insertPLogs(userId, "log-AC-EX01");
      })
      .catch((err) => {
          AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
      });

    }
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
          // variant="outlined"
          // color="primary"
          onClick={this.handleClickOpen}
          style={{
            // position: "absolute",
            // right: "26px",
            // top: "26px",
            zIndex: "10",
            width: "148px",
            textTransform: "initial",
          }}
        >
           {t("accounts.account.pop-craete.btn-create")}
        </div>
        <Dialog
          // onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          // maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("accounts.account.pop-craete.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="signup">
              <form onSubmit={this.submitForm}>
                <input
                  type="text"
                  placeholder="Userid"
                  name="userid"
                  value={this.state.userid}
                  onChange={this.onChanged}
                />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChanged}
                />
                <input
                  type="password"
                  placeholder="Retype password"
                  name="retype_password"
                  value={this.state.retype_password}
                  onChange={this.onChanged}
                />
              </form>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRegister} color="primary">
              {t("common.btn.register")}
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

export default withTranslation()(withStyles(styles)(AddMembers));
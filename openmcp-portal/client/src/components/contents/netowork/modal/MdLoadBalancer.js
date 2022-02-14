import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { withTranslation } from "react-i18next";
import MetricSelectBox from "../../metrics/module/MetricSelectBox.js";

let popup;
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

class MdLoadBalancer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectBoxData: "",
      cluster: "",
    };
    // this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {}

  handleClickOpen = () => {
    // if (Object.keys(this.props.clusters).length === 0) {
    //   alert("Please Select Policy");
    //   this.setState({ open: false });
    //   return;
    // }
    this.setState({
      cluster: this.props.selectBoxData[0].value,
      open: true,
    });
  };

  onSelectBoxChange = (data) => {
    this.setState({ cluster: data });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSave = (e) => {};

  render() {
    const { t } = this.props;
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
            left: "135px",
            top: "45.5px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t(`network.loadbalancer.title`)}
        </Button>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
          fullWidth={false}
          maxWidth={false}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {t("network.loadbalancer.title")}
          </DialogTitle>
          <DialogContent dividers>
            <div className="pd-resource-config select">
              <div
                className="res"
                style={{ display: "flex", padding: "6px 0 26px 0" }}
              >
                <Typography id="select-mode" gutterBottom style={{paddingTop:"4px"}}>
                  Cluster
                </Typography>
                <div style={{margin:"0 90px 0 40px"}}>
                  <MetricSelectBox
                    rows={this.props.selectBoxData}
                    onSelectBoxChange={this.onSelectBoxChange}
                    defaultValue=""
                  ></MetricSelectBox>
                </div>
                <div>
                  <LoadbalancePopup cluster={this.state.cluster} t={t} />
                </div>
              </div>
            </div>
          </DialogContent>
          {/* <DialogActions>
            <Button onClick={this.handleSave} color="primary">
              {t("common.btn.save")}
            </Button>
            <Button onClick={this.handleClose} color="primary">
              {t("common.btn.cancel")}
            </Button>
          </DialogActions> */}
        </Dialog>
      </div>
    );
  }
}

class LoadbalancePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      visibility: "hidden",
      completed: 0,
    };
  }

  componentWillMount() {}

  callApi = async () => {
    const response = await fetch(
      `/apis/network/loadbalancer?clusterName=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };

  handleClickOpen = () => {
    console.log(popup);

    if(popup !== undefined){
      // popup.close();
    }

    const t = this.props.t;
    this.callApi()
      .then((res) => {
        if (res !== null) {
          let url = "";
          if (res.ip !== "-" && res.port !== 0) {
            url = `http://${res.ip}:${res.port}/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          } else {
            alert(t("network.loadbalancer.msg.noneData"));
            return;
          }

          const cluster = this.props.cluster;
          if (cluster === "openmcp") {
            url = `http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          } else if (cluster === "cluster04") {
            url = `http://115.94.141.62:20002/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          }

          let innerHeight = window.innerHeight;
          let outerHeight= window.outerHeight;
          let topAreaHeight = 124;
          let popupWidth = 995;
          let innerWidth = window.innerWidth; //1618;
          let menuWidth= 178;
          let areaWidth = menuWidth + (innerWidth-menuWidth)/2 - (popupWidth)/2;

          var options = {
            height: innerHeight, // sets the height in pixels of the window.
            width: popupWidth, // sets the width in pixels of the window.
            toolbar: 0, // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
            scrollbars: 0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
            status: 0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
            resizable: 1, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
            left: areaWidth, // left position when the window appears.
            // top: 100, // top position when the window appears.
            top: outerHeight-topAreaHeight, // top position when the window appears.
            center: 0, // should we center the window? {1 (YES) or 0 (NO)}. overrides top and left
            createnew: 0, // should we create a new window for each occurance {1 (YES) or 0 (NO)}.
            location: 0, // determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
            menubar: 0 // determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
        };

          var parameters = "location=" + options.location +
          ",menubar=" + options.menubar +
          ",height=" + options.height +
          ",width=" + options.width +
          ",toolbar=" + options.toolbar +
          ",scrollbars=" + options.scrollbars +
          ",status=" + options.status +
          ",resizable=" + options.resizable +
          ",left=" + options.left +
          ",screenX=" + options.left +
          ",top=" + options.top +
          ",screenY=" + options.top;

          popup = 
          window.open(
            url,
            cluster,
            parameters
          );
          // popup.open();
        }
      })
      .catch((err) => console.log(err));
  };

  componentDidUpdate(prevProps, prevState) {}

  render() {
    const t = this.props.t;
    return (
      <div>
        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleClickOpen}
          style={{
            zIndex: "10",
            width: "80px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t("common.btn.open")}
        </Button>
      </div>
    );
  }
}

export default withTranslation()(MdLoadBalancer);

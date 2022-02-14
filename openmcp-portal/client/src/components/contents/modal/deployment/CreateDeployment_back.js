// import React, { Component } from "react";
// import AceEditor from "react-ace";
// import "ace-builds/src-noconflict/mode-yaml";
// import "ace-builds/src-noconflict/theme-nord_dark";

// import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
// import Dialog from "@material-ui/core/Dialog";
// import MuiDialogTitle from "@material-ui/core/DialogTitle";
// import MuiDialogContent from "@material-ui/core/DialogContent";
// import MuiDialogActions from "@material-ui/core/DialogActions";
// import IconButton from "@material-ui/core/IconButton";
// import CloseIcon from "@material-ui/icons/Close";
// import Typography from "@material-ui/core/Typography";
// import { withTranslation } from "react-i18next";
// import { AsyncStorage } from "AsyncStorage";
// import MetricSelectBox from "../../metrics/module/MetricSelectBox";
// import SelectBox from "../../../modules/SelectBox.js";
// import { CircularProgress } from "@material-ui/core";
// // import Modal from "@material-ui/core/Modal";

// /*
// <Editor title="create" context={this.state.editorContext} excuteScript={this.excuteScript}/>,
  
//   excuteScript = (context) => {
//     const url = `/deployments/create`;
//     const data = {
//       yaml:context
//     };
//     console.log(context)
//     axios.post(url, data)
//     .then((res) => {
//         // alert(res.data.message);
//         this.setState({ open: false });
//         this.onUpdateData();
//     })
//     .catch((err) => {
//     });
//   }
// */

// const styles = (theme) => ({
//   root: {
//     margin: 0,
//     padding: theme.spacing(2),
//   },
//   closeButton: {
//     position: "absolute",
//     right: theme.spacing(1),
//     top: theme.spacing(1),
//     color: theme.palette.grey[500],
//   },
// });

// var context = "";

// class CreateDeployment extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       open: false,
//       context: ``,
//       cluster: "",
//       selectBoxData: "",
//       completed: 0,
//     };
//   }

//   callApi = async () => {
//     let g_clusters;
//     AsyncStorage.getItem("g_clusters", (err, result) => {
//       g_clusters = result.split(",");
//     });

//     const requestOptions = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ g_clusters: g_clusters }),
//     };

//     const response = await fetch(`/apis/metric/clusterlist`, requestOptions);
//     const body = await response.json();
//     return body;
//   };

//   componentDidMount() {
//     context = this.props.context;
//     this.timer = setInterval(this.progress, 20);
//     this.callApi()
//       .then((res) => {
//         if (res !== null) {
//           let selectBoxData = [];
//           res.forEach((item) => {
//             selectBoxData.push({ name: item, value: item });
//           });

//           this.setState({
//             cluster: res[0],
//             selectBoxData: selectBoxData,
//             context: this.props.context,
//           });
//         }
//         clearInterval(this.timer);
//       })
//       .catch((err) => console.log(err));
//   }

//   progress = () => {
//     const { completed } = this.state;
//     this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
//   };

//   onChange = (newValue) => {
//     context = newValue;
//   };

//   handleExcute = () => {
//     this.props.excuteScript(this.state.cluster, context);
//     this.setState({ open: false });
//     this.props.menuClose();
//   };

//   handleClickOpen = () => {
//     this.setState({ open: true });
//   };

//   handleClose = () => {
//     this.setState({ open: false });
//     this.props.menuClose();
//   };
//   onSelectBoxChange = (data) => {
//     this.setState({ cluster: data });
//   };

//   render() {
//     const { t } = this.props;

//     const DialogTitle = withStyles(styles)((props) => {
//       const { children, classes, onClose, ...other } = props;
//       return (
//         <MuiDialogTitle disableTypography className={classes.root} {...other}>
//           <Typography variant="h6">{children}</Typography>
//           {onClose ? (
//             <IconButton
//               aria-label="close"
//               className={classes.closeButton}
//               onClick={onClose}
//             >
//               <CloseIcon />
//             </IconButton>
//           ) : null}
//         </MuiDialogTitle>
//       );
//     });

//     const DialogContent = withStyles((theme) => ({
//       root: {
//         padding: theme.spacing(2),
//         // padding: 0,
//       },
//     }))(MuiDialogContent);

//     const DialogActions = withStyles((theme) => ({
//       root: {
//         margin: 0,
//         padding: theme.spacing(1),
//       },
//     }))(MuiDialogActions);

//     const editor = (
//       <AceEditor
//         mode="yaml"
//         theme="nord_dark"
//         onChange={this.onChange}
//         name="UNIQUE_ID_OF_DIV"
//         editorProps={{ $blockScrolling: true }}
//         width="100%"
//         fontSize="0.875rem"
//         style={{ lineHeight: "1.05rem"}}
//         value={context}
//       />
//     );

//     return (
//       <div>
//         <div
//           // variant="outlined"
//           // color="primary"
//           onClick={this.handleClickOpen}
//           style={{
//             // position: "absolute",
//             // right: "30px",
//             // top: "26px",
//             // textAlign:"center",
//             zIndex: "10",
//             width: "148px",
//             textTransform: "capitalize",
//           }}
//         >
//           {this.props.btTitle}
//         </div>
//         <Dialog
//           onClose={this.handleClose}
//           aria-labelledby="customized-dialog-title"
//           open={this.state.open}
//           fullWidth={true}
//           maxWidth={false}
//         >
//           <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
//             {this.props.title}
//           </DialogTitle>
//           {this.state.selectBoxData ? (
//             [
//               <div style={{
//                   padding: "10px 15px 0px 15px",
//                   position: "absolute",
//                   top:"68px",
//                   left :"5px",
//                   width:"100%",
//                   fontWeight:"bold",
//                 }}>Target Cluster : </div>,
//               <div
//                 style={{
//                   padding: "10px 15px 0px 15px",
//                   position: "absolute",
//                   top:"60px",
//                   left :"135px"
//                 }}
//               >
//                 <MetricSelectBox
//                   rows={this.state.selectBoxData}
//                   onSelectBoxChange={this.onSelectBoxChange}
//                   defaultValue={""}
//                 ></MetricSelectBox>
//               </div>
//             ]
//           ) : (
//             <CircularProgress
//               variant="determinate"
//               value={this.state.completed}
//               style={{
//                 position: "absolute",
//                 left: "50%",
//               }}
//             ></CircularProgress>
//           )}
//           <DialogContent dividers>
//             <diV style={{paddingTop:"33px"}}>
//               {editor}
//             </diV>
//           </DialogContent>
//           <DialogActions>
//             <Button autoFocus onClick={this.handleExcute} color="primary">
//               {t("common.btn.execution")}
//             </Button>
//             <Button autoFocus onClick={this.handleClose} color="primary">
//               {t("common.btn.cancel")}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     );
//   }
// }

// export default withTranslation()(withStyles(styles)(CreateDeployment));

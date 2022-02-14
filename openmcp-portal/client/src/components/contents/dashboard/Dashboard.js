import React, { Component } from "react";
import { NavigateNext } from "@material-ui/icons";
import { AsyncStorage } from "AsyncStorage";
import { RiDashboardFill } from "react-icons/ri";
import CustomDynamicView from "./CustomDynamicView";
import DashboardSelectModule from "../modal/dashboard/DashboardSelectModule";
import { CircularProgress } from "@material-ui/core";
import { withTranslation } from 'react-i18next';
import Editor from "../../modules/Editor";
import axios from "axios";
import ProgressTemp from "../../modules/ProgressTemp";
import * as utilLog from "../../util/UtLogs.js";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completed: 0,
      reRender: "",
      masterCluster: "",
      componentCodes:"",
      componentList: "",
      myComponentList: "",
      anchorEl: null,
      openProgress: false,
            editorContext: `---`,
    };
  }

  // componentWillMount() {
  // }

  componentWillMount() {
    this.props.menuData("none");
    this.callApi()
      .then((res) => {
        var mycomp = [];
        var comp = [];
        if (res === null) {
          this.setState({ myComponentList: "" });
        } else {
          res.forEach((item) => {
            if (item.mycomp !== null) {
              mycomp.push(item.description);
            } else {
              comp.push(item.description);
            }
          });

          this.setState({
            componentCodes: res,
            componentList: comp,
            myComponentList: mycomp,
          });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    const response = await fetch(`/apis/dashboard/components?userId=${userId}`);
    const body = await response.json();
    return body;
  };

  onRefresh = () => {
    this.callApi()
      .then((res) => {
        var mycomp = [];
        var comp = [];
        if (res === null) {
          this.setState({ myComponentList: "" });
        } else {
          res.forEach((item) => {
            if (item.mycomp !== null) {
              mycomp.push(item.description);
            } else {
              comp.push(item.description);
            }
          });

          this.setState({
            componentCodes: res,
            componentList: comp,
            myComponentList: mycomp,
          });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };
  angle = {
    full: {
      startAngle: 0,
      endAngle: 360,
    },
    half: {
      startAngle: 0,
      endAngle: 180,
    },
  };

  excuteScript = (context) => {
    if (this.state.openProgress) {
      this.setState({ openProgress: false });
    } else {
      this.setState({ openProgress: true });
    }

    const url = `/apis/yamleapply`;
    const data = {
      yaml: context,
    };

    axios
      .post(url, data)
      .then((res) => {
        // alert(res.data[0].text);
        this.setState({ openProgress: false });
        this.onRefresh();

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });

        utilLog.fn_insertPLogs(userId, "log-DS-EX01");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {if (result === "true") alert(err);});
        this.setState({ openProgress: false });
      });
  };

  closeProgress = () => {
    this.setState({ openProgress: false });
  };

  smartCityHandleClose = () => {}

  render() {
    const {t} = this.props;
    return (
      <div className="content-wrapper dashboard-main">
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}
        {/* 컨텐츠 헤더 */}
        <section className="content-header">
          <h1>
            <i>
              <RiDashboardFill />
            </i>
            <span onClick={this.onRefresh} style={{ cursor: "pointer" }}>
            {t("dashboard.title")}
            </span>
            <span>
              {this.state.myComponentList.length > 0 ||
              this.state.componentList.length > 0 ? (
                <DashboardSelectModule
                onUpdateData={this.onRefresh}
                  componentCodes={this.state.componentCodes}
                  componentList={this.state.componentList}
                  myComponentList={this.state.myComponentList}
                />
                ) : (
                  null
              )}
            </span>
            <div style={{
                  position: "absolute",
                  fontSize: "14px",
                  padding: "3px 15px 7px 15px",
                  top: "45px",
                  left: "307px",
                  color: "#4a5bb9",
                  border: "1px solid #a1abd9",
                  borderRadius: "4px",
                  cursor:"pointer"
            }}>
              <Editor
                btTitle={t("dashboard.deployService.btn-title")}
                title={t("dashboard.deployService.title")}
                context={this.state.editorContext}
                excuteScript={this.excuteScript}
                menuClose={this.smartCityHandleClose}
              />
            </div>
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li>
              <a href="/dashboard">
                <i className="fa fa-dashboard"></i> {t("common.nav.home")}
              </a>
            </li>
            <li className="active">
              <NavigateNext
                style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
              />
              {t("dashboard.title")}
            </li>
          </ol>
        </section>

        {/* 컨텐츠 내용 */}

        {this.state.myComponentList ? (
          [
            <section className="content" style={{ minWidth: 1160 }}>
              <CustomDynamicView myComponentList={this.state.myComponentList} propsData = {this.props.propsData}/>
            </section>,
          ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "absolute", left: "50%", marginTop: "20px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

// class DashboardCard02 extends Component {
//   render() {
//     return (
//       <div className="content-box" style={{ width: this.props.width }}>
//       <div className="cb-header">
//         <span>{this.props.title}</span>
//         {/* <div className="cb-btn">
//           <Link to={this.props.path}>detail</Link>
//         </div> */}
//       </div>
//       <div
//         className="cb-body"
//         style={{ position: "relative", width: "100%", display:"flex"}}
//       >
//         <PieHalfReChart data={this.props.data.cpu} angle={this.props.angle}></PieHalfReChart>
//         <PieHalfReChart data={this.props.data.memory} angle={this.props.angle}></PieHalfReChart>
//         <PieHalfReChart data={this.props.data.storage} angle={this.props.angle}></PieHalfReChart>
//       </div>
//     </div>
//     );
//   }
// }
export default withTranslation()(Dashboard); 


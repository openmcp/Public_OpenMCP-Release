import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
// import { NavLink } from "react-router-dom";
// import { NavigateNext } from "@material-ui/icons";
// import { AiOutlineUser } from "react-icons/ai";
import { CircularProgress } from "@material-ui/core";
import { AsyncStorage } from "AsyncStorage";
import MetricSelectBox from "../metrics/module/MetricSelectBox";
import { withTranslation } from "react-i18next";

class LoadBalancer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cluster: "",
      selectBoxData: "",
      completed: 0,
    };
  }

  callApi = async () => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ g_clusters: g_clusters }),
    };

    const response = await fetch(`/apis/metric/clusterlist`, requestOptions);
    const body = await response.json();
    return body;
  };

  componentDidMount() {


    let innerHeight = window.innerHeight;
    let outerHeight= window.outerHeight;
    let topAreaHeight = 124;
    // let top = 1005;

    let popupWidth = 995;
    let innerWidth = window.innerWidth; //1618;
    let menuWidth= 178;
    let areaWidth = menuWidth + (innerWidth-menuWidth)/2 - (popupWidth)/2;
    //menuWidth + (innerWidth-menuWidth)/2 - (popupWidth)/2;
    // menuWidth + innerWidth/2
    // let top = 124;
    var options = {
        height: innerHeight-150, // sets the height in pixels of the window.
        width: popupWidth, // sets the width in pixels of the window.
        toolbar: 0, // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
        scrollbars: 0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
        status: 0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
        resizable: 1, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
        left: areaWidth, // left position when the window appears.
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

    // window.open("http://www.naver.com", "Popup","toolbar=1,location=1,statusbar=1,menubar=1,scrollbars=1,resizable=1,width=1000,height=600,left=0,top=1000")

    // var test = window.open("http://google.com", "test", "width=500,height=400")
    // // test.opener.document.getElementsByClassName('gsfi')["0"].value = "test"
    window.open("http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default", "Popup",parameters)
    // window.open("http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default", "Popup","toolbar=0,location=0,statusbar=0,menubar=0,scrollbars=0,resizable=0,width=995,height=610,left=500,top=1005")
    
    // window.open("http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default", "Popup","top=500,left=-500,height=30,width=300,menubar=1,location=1,resizable=0,scrollbars=1,status=1")

    // window.open('http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default','popup',parameters);

    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if (res !== null) {
          let selectBoxData = [];
          res.forEach((item) => {
            selectBoxData.push({ name: item, value: item });
          });

          this.setState({
            cluster: res[0],
            selectBoxData: selectBoxData,
          });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  }

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  render() {
    const { t } = this.props;
    const onSelectBoxChange = (data) => {
      this.setState({ cluster: data });
    };

    // const u = `http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;

    return (
      <div className="sub-content-wrapper fulled">
        <section className="content">
          <Paper>
         {/* <iframe src={`https://localhost:3000/iframeRedirect`} scrolling="no" /> */}
         {/* <iframe src={`https://www.google.ie/gwt/x?u=${u}`} scrolling="no" /> */}
         {/* <iframe src={`${u}`} scrolling="no" /> */}
            {this.state.selectBoxData
              ? [
                  <div style={{ padding: "10px 15px 0px 15px" }}>
                    <MetricSelectBox
                      rows={this.state.selectBoxData}
                      onSelectBoxChange={onSelectBoxChange}
                      defaultValue=""
                    ></MetricSelectBox>
                  </div>,
                  <div className="iframe-ti">
                    <Paper className="iframe-paper">
                      <div className="iframe-rel">
                        {/* {this.state.selectBoxData ? (
                          <CircularProgress
                            variant="determinate"
                            value={this.state.completed}
                            style={{
                              position: "absolute",
                              left: "50%",
                              marginTop: "20px",
                            }}
                          ></CircularProgress>
                        ) : null} */}
                        <IframeModule cluster={this.state.cluster} t={t} />
                      </div>
                    </Paper>
                  </div>,
                ]
              : null}
          </Paper>
        </section>
      </div>
    );
  }
}

class IframeModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      visibility: "hidden",
      completed: 0,
    };
  }

  //http://34.146.191.162:20001

  componentWillMount() {
    this.onApiExcute();
  }

  callApi = async () => {
    const response = await fetch(
      `/apis/network/loadbalancer?clusterName=${this.props.cluster}`
    );
    const body = await response.json();
    return body;
  };

  onApiExcute = () => {
    this.progressTimer = setInterval(this.progress, 20);
    this.iframeTimer = setInterval(this.showIframe, 3000);
    // if (this.props.cluster === "cluster01") {
    //   this.setState({
    //     url: "http://34.146.191.162:20001",
    //   });
    // } else {
    //   this.setState({
    //     url: "http://13.86.153.192:20001",
    //   });
    // }

    this.callApi()
      .then((res) => {
        if (res !== null) {
          let url = "";
          // url= "http://13.86.153.192:20001";
          if (res.ip !== "-" && res.port !== 0) {
            url = `http://${res.ip}:${res.port}/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          }

          const cluster = this.props.cluster;
          if (cluster === "openmcp") {
            url = `http://115.94.141.62:20001/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          } else if (cluster === "cluster04") {
            url = `http://115.94.141.62:20002/kiali/console/graph/namespaces/?edges=requestDistribution&graphType=app&idleNodes=false&duration=604800&refresh=30000&operationNodes=false&idleEdges=false&injectServiceNodes=false&layout=dagre&namespaces=default`;
          }

          this.setState({
            url: url,
          });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.cluster !== prevProps.cluster) {
      this.setState({
        visibility: "hidden",
      });
      this.onApiExcute();
    }
  }

  showIframe = () => {
    this.setState({ visibility: "visible" });
    clearInterval(this.iframeTimer);
    clearInterval(this.progressTimer);
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  render() {
    const t = this.props.t;

    
    return (
      <div>
        
        {this.state.url === "" ? (
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              top: "68px",
              margin: "auto",
              left: "0",
              right: "0",
              visibility: `${this.state.visibility}`,
            }}
          >
            {t("network.loadbalancer.msg.noneData")}
          </div>
        ) : null}
        <div
          className="iframe-abs"
          style={{ visibility: `${this.state.visibility}` }}
        >
          {this.state.url !== "" ? (
            <iframe title="loadBalancer" src={`${this.state.url}`} scrolling="no" />
          ) : null}
        </div>
        {this.state.visibility === "hidden" ? (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{
              position: "absolute",
              left: "50%",
              marginTop: "20px",
            }}
          ></CircularProgress>
        ) : null}
      </div>
    );
  }
}

export default withTranslation()(LoadBalancer);

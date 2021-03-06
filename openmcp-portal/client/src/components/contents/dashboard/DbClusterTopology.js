import React, { Component } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import * as utilLog from "../../util/UtLogs.js";
import * as util from "../../util/Utility.js";
import { AsyncStorage } from "AsyncStorage";
import axios from "axios";
import { Button, CircularProgress } from "@material-ui/core";
import { withTranslation } from "react-i18next";

am4core.useTheme(am4themes_animated);
let series;
let urlHistory;
class DbClusterTopology extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: "",
      loadErr: "",
      completed: 0,
      reRender: "",
      masterCluster: "",
      componentList: [],
    };
  }

  componentWillMount() {}
  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  componentDidMount() {
    // this.timer2 = setInterval(this.onRefresh, 50000);
    this.onInitTopology();
    this.onRefresh();
    urlHistory = this.props.propsData.info.history;

    let userId = null;
    AsyncStorage.getItem("userName", (err, result) => {
      userId = result;
    });
    utilLog.fn_insertPLogs(userId, "log-DS-VW06");
  }

  callApi = async () => {
    const response = await fetch(`/apis/dashboard/cluster_topology`);
    const body = await response.json();
    return body;
  };

  componentWillUnmount() {
    // clearInterval(this.timer2);
    if (this.chart) {
      this.chart.dispose();
    }
  }

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  onRefresh = () => {
    const { t } = this.props;
    this.setState({ loadErr: "", rows: "" });
    series.data = null;

    this.timer = setInterval(this.progress, 20);

    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const url = `/apis/dashboard/cluster_topology`;
    const data = {
      g_clusters: g_clusters,
      pathRegion:
        "M13,23l5.5-5.5a7.778,7.778,0,1,0-11,0Zm0,3.142L5.929,19.071a10,10,0,1,1,14.142,0Zm0-11.92A2.222,2.222,0,1,0,10.778,12,2.222,2.222,0,0,0,13,14.222Zm0,2.222A4.444,4.444,0,1,1,17.444,12,4.444,4.444,0,0,1,13,16.444Z",
      pathCluster:
        "M27.049,39.78,22.3,41.964a.484.484,0,0,1-.355,0L17.2,39.78c-.1-.045-.1-.118,0-.163l1.137-.522a.485.485,0,0,1,.355,0l3.257,1.5a.481.481,0,0,0,.355,0l2.118-.973,1.139-.523a.484.484,0,0,1,.355,0l1.137.523c.1.044.1.117,0,.162Zm0-3.048-1.137-.523a.484.484,0,0,0-.355,0l-3.257,1.5a.486.486,0,0,1-.355,0l-3.257-1.5a.485.485,0,0,0-.355,0l-1.137.523c-.1.045-.1.118,0,.163l4.749,2.183a.484.484,0,0,0,.355,0L27.049,36.9C27.147,36.851,27.147,36.778,27.049,36.733ZM17.2,34.194l4.749,2.015a.523.523,0,0,0,.355,0l4.749-2.015c.1-.042.1-.109,0-.15L22.3,32.029a.518.518,0,0,0-.355,0L17.2,34.044C17.1,34.085,17.1,34.153,17.2,34.194Z",
      pathPod:
        "M12.673,4.247l-4.95-2.2a.551.551,0,0,0-.447,0l-4.95,2.2c-.011,0-.019.013-.03.019a.445.445,0,0,0-.046.022c-.012.008-.021.019-.033.028a.478.478,0,0,0-.1.107c-.011.015-.023.029-.032.045a.616.616,0,0,0-.042.091c0,.015-.013.029-.017.043A.557.557,0,0,0,2,4.75v5.5a.549.549,0,0,0,.327.5l4.95,2.2a.518.518,0,0,0,.444-.006l0,.006,4.95-2.2a.549.549,0,0,0,.327-.5V4.75A.549.549,0,0,0,12.673,4.247ZM7.5,3.152l3.6,1.6-3.6,1.6-.719-.32L3.9,4.75ZM3.1,9.893V5.6L6.95,7.307v4.3L3.1,9.893ZM8.05,11.6v-4.3L11.9,5.6v4.3Z",
    };

    axios
      .post(url, data)
      .then((res) => {
        if (res === null) {
          this.setState({ rows: "" });
        } else {
          if (res.data.hasOwnProperty("errno")) {
            if (res.data.code === "ECONNREFUSED") {
              this.setState({ loadErr: t("dashboard.connectionFailed") });
            }
          } else {
            this.setState({ rows: res.data.topology });
            series.data = res.data.topology;
          }
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });

        utilLog.fn_insertPLogs(userId, "log-DS-VW05");
      })
      .catch((err) => {
        AsyncStorage.getItem("useErrAlert", (error, result) => {
          if (result === "true") alert(err);
        });
      });
  };

  onInitTopology = () => {
    var chart = am4core.create(
      "clusterTopology",
      am4plugins_forceDirected.ForceDirectedTree
    );
    series = chart.series.push(
      new am4plugins_forceDirected.ForceDirectedSeries()
    );
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.maxHeight = 120;
    chart.legend.scrollable = true;

    // let marker = chart.legend.markers.template.children.getIndex(0);
    // marker.cornerRadius(1, 12, 12, 12);

    // chart.zoomable = true;
    chart.mouseWheelBehavior = "none";
    chart.zoomStep = 4;

    chart.zoomOutButton.background.cornerRadius(5, 5, 5, 5);
    chart.zoomOutButton.background.fill = am4core.color("#25283D");
    chart.zoomOutButton.icon.stroke = am4core.color("#EFD9CE");
    chart.zoomOutButton.icon.strokeWidth = 2;
    // chart.events.on("ready", function() {
    //   chart.zoomToPoint({x:chart.innerWidth/2, y:chart.innerHeight/2}, 1, true)
    // });

    // series.colors.list = [
    // am4core.color("#67b7dc"),
    // am4core.color("#6771dc"),
    // am4core.color("#a367dc"),
    // am4core.color("#dc67ce"),
    // am4core.color("#dc6788"),
    // am4core.color("#EC7505"),
    // am4core.color("#E89005"),
    // am4core.color("#dcd267"),
    // am4core.color("#dc8c67"),
    // am4core.color("#845EC2"),
    // am4core.color("#D65DB1"),
    // am4core.color("#FF6F91"),
    // am4core.color("#FF9671"),
    // am4core.color("#FFC75F"),
    // am4core.color("#F9F871"),
    // ];

    series.dataFields.linkWith = "linkWith";
    series.dataFields.name = "name";
    series.dataFields.id = "id";
    series.dataFields.value = "value";
    series.dataFields.children = "children";
    series.dataFields.color = "color";
    series.fontSize = 11;
    series.minRadius = 10;
    series.maxRadius = 30;
    series.maxLevels = 3;
    series.centerStrength = 3; //????????? ???????????? ????????? ????????? ??????
    series.manyBodyStrength = -40; //????????? ??????
    // series.centerStrength = 0.5; //????????? ???????????? ????????? ????????? ??????
    // series.manyBodyStrength = -5; //????????? ??????
    // series.centerStrength = 2; //????????? ???????????? ????????? ????????? ??????
    // series.manyBodyStrength = -20; //????????? ??????

    series.links.template.strength = 1.8;
    series.links.template.strokeWidth = 2;
    series.links.template.distance = 1.2; //???????????? ??????

    // series.nodes.template.tooltipText = "{name} [bold]{status}[/]";
    series.nodes.template.tooltipText = "{name}";
    series.nodes.template.fillOpacity = 1;
    series.nodes.template.circle.strokeOpacity = 0;
    series.nodes.template.label.text = "{name}";
    series.nodes.template.label.hideOversized = true;
    series.nodes.template.label.truncate = true;
    series.nodes.template.togglable = false; //????????? ???????????? ??????

    let icon = series.nodes.template.createChild(am4core.Sprite);
    icon.propertyFields.path = "path";
    icon.horizontalCenter = "middle";
    icon.verticalCenter = "middle";
    icon.paddingBottom = 5;
    icon.fill = "#fff";
    icon.strokeOpacity = 0;
    // icon.scale = 1.0;
    // icon.width = 100;
    // icon.height = 100;

    var hoverState = series.links.template.states.create("hover");
    hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;

    series.nodes.template.events.on("hit", function (event) {
      if (event.target.dataItem.level === 2) {
        let podName = event.target.dataItem.dataContext.name;
        let cluster = event.target.dataItem.dataContext.data.cluster;
        let namespace = event.target.dataItem.dataContext.data.namespace;

        let url = `/pods/${podName}/overview?cluster=${cluster}&project=${namespace}`;
        urlHistory.push(url);
      } else {
        chart.zoomToDataItem(event.target.dataItem, 2, true);
      }

      // alert(event.target.dataItem.dataContext.data);
      // chart.zoomToDataItem(event.target.dataItem, 1, true)
      // if (event.target.isActive) {
      //   chart.zoomToDataItem(event.target.dataItem, chart.zoomFactor, true)
      // }
      // else {
      //   console.log(chart.zoomFactor);
      // }
    });

    series.nodes.template.events.on("over", function (event) {
      event.target.dataItem.childLinks.each(function (link) {
        link.isHover = true;
      });
      if (event.target.dataItem.parentLink) {
        event.target.dataItem.parentLink.isHover = true;
      }
    });

    series.nodes.template.events.on("out", function (event) {
      event.target.dataItem.childLinks.each(function (link) {
        link.isHover = false;
      });
      if (event.target.dataItem.parentLink) {
        event.target.dataItem.parentLink.isHover = false;
      }
    });

    series.nodes.template.adapter.add("fill", function (fill, target) {
      if (target.dataItem.level === 0) {
        target.label.fontSize = 13;
        target.label.dy = 15;
        return fill.lighten(target.dataItem.level * -0.15);
      } else if (target.dataItem.level === 1) {
        target.label.dy = 10;
        return fill.lighten(target.dataItem.level * -0.15);
      } else if (target.dataItem.level === 2) {
        target.label.dy = 8;

        var before5min = new Date(util.getDateBefore("m", 5));

        var createdTime = new Date(
          util.convertUTCTime(
            new Date(target.dataItem.dataContext.created_time),
            "%Y-%m-%d %H:%M:%S",
            false
          )
        );

        if (target.dataItem.dataContext.status !== "Running") {
          return am4core.color("#EC4E05");
        } else if (createdTime > before5min) {
          return am4core.color("#2682D8");
        }
        return am4core.color("#0B2844");
      } else {
      }
      return fill.lighten(target.dataItem.level * -0.15);
    });

    // series.links.template.adapter.add("distance", function(distance, target) {
    //   if(target.dataItem.level === 2){
    //     return 1.7
    //   }
    //   return distance;
    // });
  };

  render() {
    const { t } = this.props;
    return (
      <div className="dash-comp" style={{ width: "100%" }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={this.onRefresh}
          style={{
            position: "absolute",
            right: "2px",
            top: "-42px",
            zIndex: "10",
            width: "148px",
            height: "31px",
            textTransform: "capitalize",
          }}
        >
          {t("dashboard.topology.btn-refresh")}
        </Button>

        <div
          className="topology"
          id="clusterTopology"
          style={{ width: "100%", height: "700px" }}
        ></div>
        {this.state.rows ? null : (
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              top: "0px",
              left: "0px",
              right: "0px",
              margin: "25% auto",
            }}
          >
            {this.state.loadErr ? (
              <div>{this.state.loadErr}</div>
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
              ></CircularProgress>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation()(DbClusterTopology);

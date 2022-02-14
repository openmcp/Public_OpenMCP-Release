import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { NavigateNext } from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";
import {
  SearchState,
  IntegratedFiltering,
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  Toolbar,
  SearchPanel,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from "@devexpress/dx-react-grid-material-ui";
import SelectBox from "../../modules/SelectBox";
import PieReChart2 from "../../modules/PieReChart2";
import * as utilLog from "./../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import ChangeAKSReource from "../modal/chageResource/ChangeAKSReource";
import { withTranslation } from "react-i18next";

let apiParams = "";
class CsOverview extends Component {
  state = {
    rows: "",
    completed: 0,
    reRender: "",
  };

  componentWillMount() {
    const result = {
      menu: "clusters",
      title: this.props.match.params.cluster,
      pathParams: {
        cluster: this.props.match.params.cluster,
        // state : this.props.location.state.data
      },
    };
    this.props.menuData(result);
    apiParams = this.props.match.params.cluster;
  }

  componentDidMount() {
    //데이터가 들어오기 전까지 프로그래스바를 보여준다.
    this.timer = setInterval(this.progress, 20);
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-CL-VW03");
      })
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    var param = this.props.match.params.cluster;
    const response = await fetch(`/clusters/${param}/overview`);
    const body = await response.json();
    return body;
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  onRefresh = () => {
    console.log("onClick");
    this.callApi()
      .then((res) => {
        if (res === null) {
          this.setState({ rows: [] });
        } else {
          this.setState({ rows: res });
        }
        clearInterval(this.timer);
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { t } = this.props;

    return (
      <div>
        <div className="content-wrapper cluster-overview">
          {/* 컨텐츠 헤더 */}
          <section className="content-header">
            <h1>
              {this.props.match.params.cluster}
              <small>
                <NavigateNext className="detail-navigate-next"/>
                {t("clusters.detail.overview.name")}
              </small>
            </h1>
            <ol className="breadcrumb">
              <li>
                <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
              </li>
              <li>
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                <NavLink to="/clusters">{t("clusters.title")}</NavLink>
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("clusters.detail.overview.name")}
              </li>
            </ol>
          </section>

          {/* 내용부분 */}
          <section className="content">
            {this.state.rows ? (
              [
                <BasicInfo
                  rowData={this.state.rows.basic_info}
                  t={t}
                  //  provider={this.props.location.state.data == undefined ? "-" : this.props.location.state.data.provider }
                  //  region={this.props.location.state.data == undefined ? "-" : this.props.location.state.data.region}
                />,
                <div style={{ display: "flex" }}>
                  <ProjectUsageTop5
                    rowData={this.state.rows.project_usage_top5}
                    t={t}
                  />
                  <NodeUsageTop5
                    rowData={this.state.rows.node_usage_top5}
                    t={t}
                  />
                </div>,
                <ClusterResourceUsage
                  rowData={this.state.rows.cluster_resource_usage}
                  onRefresh={this.onRefresh}
                  clusterInfo={this.state.rows.basic_info}
                  t={t}
                />,
                <KubernetesStatus
                  rowData={this.state.rows.kubernetes_status}
                  t={t}
                />,
                <Events rowData={this.state.rows.events} t={t} />,
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </section>
        </div>
      </div>
    );
  }
}

class BasicInfo extends Component {
  render() {
    const t = this.props.t;
    return (
      <div className="content-box">
        <div className="cb-header">
          {t("clusters.detail.overview.basicInfo.name")}
        </div>
        <div className="cb-body">
          <div>
            <span>{t("clusters.detail.overview.basicInfo.sub.name")} : </span>
            <strong>{this.props.rowData.name}</strong>
          </div>
          <div>
            <span>
              {t("clusters.detail.overview.basicInfo.sub.provider")} :{" "}
            </span>
            {this.props.rowData.provider}
          </div>
          <div>
            <span>
              {t("clusters.detail.overview.basicInfo.sub.version")} :{" "}
            </span>
            {this.props.rowData.kubernetes_version}
          </div>
          <div>
            <span>{t("clusters.detail.overview.basicInfo.sub.status")} : </span>
            {this.props.rowData.status}
          </div>
          <div>
            <span>{t("clusters.detail.overview.basicInfo.sub.region")} : </span>
            {this.props.rowData.region}
          </div>
          <div>
            <span>{t("clusters.detail.overview.basicInfo.sub.zone")} : </span>
            {this.props.rowData.zone}
          </div>
        </div>
      </div>
    );
  }
}

class ProjectUsageTop5 extends Component {
  state = {
    columns: [],
    rows: this.props.rowData.cpu,
  };

  callApi = async () => {
    const response = await fetch(`/clusters/${apiParams}/overview`);
    const body = await response.json();
    return body;
  };

  render() {
    const t = this.props.t;

    const columns = [
      {
        name: "name",
        title: t("clusters.detail.overview.projectUsage.grid.name"),
      },
      {
        name: "usage",
        title: t("clusters.detail.overview.projectUsage.grid.usage"),
      },
    ];

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );

    const onSelectBoxChange = (data) => {
      switch (data) {
        case "cpu":
          this.callApi()
            .then((res) => {
              this.setState({ rows: res.project_usage_top5.cpu });
            })
            .catch((err) => console.log(err));

          break;
        case "memory":
          this.callApi()
            .then((res) => {
              this.setState({ rows: res.project_usage_top5.memory });
            })
            .catch((err) => console.log(err));

          break;
        default:
          this.setState(this.props.rowData.cpu);
      }
    };

    const selectBoxData = [
      { name: "cpu", value: "cpu" },
      { name: "memory", value: "memory" },
    ];
    return (
      <div className="content-box col-sep-2">
        <div className="cb-header">
          {t("clusters.detail.overview.projectUsage.name")}
          <SelectBox
            rows={selectBoxData}
            onSelectBoxChange={onSelectBoxChange}
            defaultValue=""
          ></SelectBox>
        </div>

        <div className="cb-body table-style">
          {this.state.aaa}
          <Grid rows={this.state.rows} columns={columns}>
            {/* Sorting */}
            <SortingState
              defaultSorting={[{ columnName: "usage", direction: "desc" }]}
            />
            <IntegratedSorting />

            <Table />
            <TableHeaderRow showSortingControls rowComponent={HeaderRow} />
          </Grid>
        </div>
      </div>
    );
  }
}

class NodeUsageTop5 extends Component {
  state = {
    columns: [
      { name: "name", title: "Name" },
      { name: "usage", title: "Usage" },
    ],
    rows: this.props.rowData.cpu,
    unit: " core",
  };

  callApi = async () => {
    const response = await fetch(`/clusters/${apiParams}/overview`);
    const body = await response.json();
    return body;
  };

  render() {
    const t = this.props.t;

    const columns = [
      {
        name: "name",
        title: t("clusters.detail.overview.nodeUsage.grid.name"),
      },
      {
        name: "usage",
        title: t("clusters.detail.overview.nodeUsage.grid.usage"),
      },
    ];

    const Cell = (props) => {
      const { column } = props;
      // console.log("cell : ", props);
      if (column.name === "usage") {
        return (
          <Table.Cell {...props} style={{ cursor: "pointer" }}>
            {props.value + this.state.unit}
          </Table.Cell>
        );
      }
      return <Table.Cell {...props} />;
    };

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );

    const onSelectBoxChange = (data) => {
      switch (data) {
        case "cpu":
          this.setState({
            rows: this.props.rowData.cpu,
            unit: " core",
          });

          // this.callApi()
          // .then((res) => {
          //   this.setState({ rows: res.node_usage_top5.cpu });
          // })
          // .catch((err) => console.log(err));

          break;
        case "memory":
          this.setState({
            rows: this.props.rowData.memory,
            unit: " Gi",
          });

          // this.callApi()
          // .then((res) => {
          //   this.setState({ rows: res.node_usage_top5.memory });
          // })
          // .catch((err) => console.log(err));

          break;
        default:
          this.setState(this.props.rowData.cpu);
      }
    };

    const selectBoxData = [
      { name: "cpu", value: "cpu" },
      { name: "memory", value: "memory" },
    ];
    return (
      <div className="content-box col-sep-2">
        <div className="cb-header">
          {t("clusters.detail.overview.nodeUsage.name")}
          <SelectBox
            rows={selectBoxData}
            onSelectBoxChange={onSelectBoxChange}
            defaultValue=""
          ></SelectBox>
        </div>

        <div className="cb-body table-style">
          {this.state.aaa}
          <Grid rows={this.state.rows} columns={columns}>
            {/* Sorting */}
            <SortingState
              defaultSorting={[{ columnName: "usage", direction: "desc" }]}
            />
            <IntegratedSorting />

            <Table cellComponent={Cell} />
            <TableHeaderRow showSortingControls rowComponent={HeaderRow} />
          </Grid>
        </div>
      </div>
    );
  }
}

// 갱신전

class ClusterResourceUsage extends Component {
  state = {
    rows: this.props.rowData,
    colors: ["#0088FE", "#ecf0f5"],
    unhColors: ["#0088FE", "#ecf0f5"],
  };

  angle = {
    full: {
      startAngle: 0,
      endAngle: 360,
    },
    half: {
      startAngle: 180,
      endAngle: 0,
    },
  };

  componentWillUpdate(prevProps, prevState) {
    if (this.props.rowData !== prevProps.rowData) {
      this.setState({
        rows: prevProps.rowData,
      });
    }
  }

  render() {
    const t = this.props.t;
    return (
      <div className="content-box">
        <div className="cb-header">
          <span style={{ cursor: "cluster1" }}>
            {t("clusters.detail.overview.resourceUsage.name")}
          </span>
          {this.props.clusterInfo.provider === "aks" ? (
            <ChangeAKSReource clusterInfo={this.props.clusterInfo} />
          ) : (
            ""
          )}
        </div>
        <div className="cb-body flex">
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">CPU</div>
            <PieReChart2
              data={this.state.rows.cpu}
              angle={this.angle.half}
              unit={this.state.rows.cpu.unit}
              colors={this.state.unhColors}
            ></PieReChart2>
          </div>
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">Memory</div>
            <PieReChart2
              data={this.state.rows.memory}
              angle={this.angle.half}
              unit={this.state.rows.memory.unit}
              colors={this.state.unhColors}
            ></PieReChart2>
          </div>
          <div className="cb-body-content pie-chart">
            <div className="cb-sub-title">Storage</div>
            <PieReChart2
              data={this.state.rows.storage}
              angle={this.angle.half}
              unit={this.state.rows.storage.unit}
              colors={this.state.colors}
            ></PieReChart2>
          </div>
        </div>
      </div>
    );
  }
}

class KubernetesStatus extends Component {
  state = {
    rows: this.props.rowData,
  };
  render() {
    const t = this.props.t;
    return (
      <div className="content-box cb-kube-status">
        <div className="cb-header">
          {t("clusters.detail.overview.kubeStatus.name")}
        </div>
        <div className="cb-body flex">
          {this.state.rows.map((item) => {
            return (
              <div className={"cb-body-content " + item.status}>
                <div>{item.name}</div>
                <div>({item.status})</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      defaultColumnWidths: [
        { columnName: "project", width: 150 },
        { columnName: "type", width: 150 },
        { columnName: "reason", width: 150 },
        { columnName: "object", width: 240 },
        { columnName: "message", width: 440 },
        { columnName: "time", width: 180 },
      ],
      rows: this.props.rowData,

      // Paging Settings
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 10,
      pageSizes: [5, 10, 15, 0],

      completed: 0,
    };
  }

  componentWillMount() {
    // this.props.onSelectMenu(false, "");
  }

  render() {
    const t = this.props.t;
    const columns = [
      {
        name: "project",
        title: t("clusters.detail.overview.events.grid.project"),
      },
      { name: "type", title: t("clusters.detail.overview.events.grid.type") },
      {
        name: "reason",
        title: t("clusters.detail.overview.events.grid.reason"),
      },
      {
        name: "object",
        title: t("clusters.detail.overview.events.grid.object"),
      },
      {
        name: "message",
        title: t("clusters.detail.overview.events.grid.message"),
      },
      { name: "time", title: t("clusters.detail.overview.events.grid.time") },
    ];

    const HeaderRow = ({ row, ...restProps }) => (
      <Table.Row
        {...restProps}
        style={{
          cursor: "pointer",
          backgroundColor: "whitesmoke",
          // ...styles[row.sector.toLowerCase()],
        }}
        // onClick={()=> alert(JSON.stringify(row))}
      />
    );
    const Row = (props) => {
      // console.log("row!!!!!! : ",props);
      return <Table.Row {...props} key={props.tableRow.key} />;
    };

    return (
      <div className="content-box">
        <div className="cb-header">
          {t("clusters.detail.overview.events.name")}
        </div>
        <div className="cb-body">
          <Paper>
            {this.state.rows ? (
              [
                <Grid rows={this.state.rows} columns={columns}>
                  <Toolbar />
                  {/* 검색 */}
                  <SearchState defaultValue="" />
                  <IntegratedFiltering />
                  <SearchPanel style={{ marginLeft: 0 }} />

                  {/* Sorting */}
                  <SortingState
                    defaultSorting={[
                      { columnName: "status", direction: "desc" },
                    ]}
                  />
                  <IntegratedSorting />

                  {/* 페이징 */}
                  <PagingState
                    defaultCurrentPage={0}
                    defaultPageSize={this.state.pageSize}
                  />
                  <IntegratedPaging />
                  <PagingPanel pageSizes={this.state.pageSizes} />

                  {/* 테이블 */}
                  <Table rowComponent={Row} />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.defaultColumnWidths}
                  />
                  <TableHeaderRow
                    showSortingControls
                    rowComponent={HeaderRow}
                  />
                </Grid>,
              ]
            ) : (
              <CircularProgress
                variant="determinate"
                value={this.state.completed}
                style={{ position: "absolute", left: "50%", marginTop: "20px" }}
              ></CircularProgress>
            )}
          </Paper>
        </div>
      </div>
    );
  }
}

export default withTranslation()(CsOverview);

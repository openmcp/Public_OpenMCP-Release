import React, { Component } from "react";
// import CircularProgress from "@material-ui/core/CircularProgress";
import { CircularProgress, TextField } from "@material-ui/core";
import * as utilLog from "../../../util/UtLogs.js";
import { AsyncStorage } from "AsyncStorage";
import {
  PagingState,
  SortingState,
  SelectionState,
  IntegratedFiltering,
  IntegratedPaging,
  IntegratedSorting,
  // RowDetailState,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
  TableSelection,
  // TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import ProgressTemp from "./../../../modules/ProgressTemp";
import Confirm2 from "./../../../modules/Confirm2";
import { withTranslation } from "react-i18next";

class AddKVMNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newVmName: "",
      newVmPassword: "",
      templateVm: "",
      columns: [],
      defaultColumnWidths: [
        { columnName: "name", width: 130 },
        { columnName: "status", width: 130 },
        { columnName: "provider", width: 130 },
        { columnName: "cpu", width: 130 },
        { columnName: "memory", width: 120 },
      ],
      currentPage: 0,
      setCurrentPage: 0,
      pageSize: 3,
      pageSizes: [3, 6, 12, 0],
      clusters: "",
      selection: [],
      selectedRow: "",
      value: 0,

      confirmOpen: false,
      confirmInfo: {
        title: "Add Node Confirm",
        context: "Are you sure you want to add Node?",
        button: {
          open: "",
          yes: "CONFIRM",
          no: "CANCEL",
        },
      },
      confrimTarget: "",
      confirmTargetKeyname: "",
      completed: 0,
    };
  }

  componentDidMount() {
    
    // this.initState();
    // this.callApi("/kvm/clusters")
    //   .then((res) => {
    //     this.setState({ clusters: res });
    //     let userId = null;
    //     AsyncStorage.getItem("userName", (err, result) => {
    //       userId = result;
    //     });
    //     utilLog.fn_insertPLogs(userId, "log-ND-VW06");
    //   })
    //   .catch((err) => console.log(err));

    this.timer = setInterval(this.progress, 20);
    this.initState();
    this.setState({
      open: true,
    });
    this.callApi(`/clusters/public-cloud`)
      .then((res) => {
        this.setState({ clusters: res });
        clearInterval(this.timer);

        let userId = null;
        AsyncStorage.getItem("userName", (err, result) => {
          userId = result;
        });
        utilLog.fn_insertPLogs(userId, "log-ND-VW05");
      })
      .catch((err) => console.log(err));
  }

  initState = () => {
    this.setState({
      selection: [],
      selectedRow: "",
      newVmName: "",
      newVmPassword: "",
      templateVm: "",
    });
  };

  progress = () => {
    const { completed } = this.state;
    this.setState({ completed: completed >= 100 ? 0 : completed + 1 });
  };

  handleSaveClick = () => {
    const t = this.props.t;

    if (this.state.newVmName === "") {
      alert(t("nodes.pop-addNode.msg-checkVmName"));
      return;
    } else if (this.state.newVmPassword === "") {
      alert(t("nodes.pop-addNode.msg-checkVmPassword"));
      return;
    } else if (Object.keys(this.state.selectedRow).length === 0) {
      alert(t("common.msg.unselected-target"));
      return;
    } else if (this.state.templateVm === "") {
      alert(t("nodes.pop-addNode.msg-checkTempImgName"));
      return;
    } else {
      this.setState({
        confirmOpen: true,
      });
    }
  };

  //callback
  confirmed = (result) => {
    this.setState({ confirmOpen: false });

    //loading이 보여지게 해야함
    this.setState({ openProgress: true });

    if (result) {
      //Add Node 수행
      const url = `/nodes/add/kvm`;
      const data = {
        newvm: this.state.newVmName,
        template: this.state.templateVm,
        newVmPassword: this.state.newVmPassword,
        cluster: this.state.selectedRow.name,
      };
      axios
        .post(url, data)
        .then((res) => {
          if (res.data.code === 500) {
            // alert(res.data.result + "\n" + res.data.text);
          } else {
            this.props.handleClose();
            let userId = null;
            AsyncStorage.getItem("userName", (err, result) => {
              userId = result;
            });
            utilLog.fn_insertPLogs(userId, "log-ND-EX07");
          }
          this.setState({ openProgress: false });
        })
        .catch((err) => {
          this.setState({ openProgress: false });
          this.props.handleClose();
        });
    } else {
      this.setState({ confirmOpen: false });
      this.setState({ openProgress: false });
    }
  };

  callApi = async (uri) => {
    let g_clusters;
    AsyncStorage.getItem("g_clusters", (err, result) => {
      g_clusters = result.split(",");
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        g_clusters: g_clusters,
        provider: "On-Premise",
      }),
    };

    const response = await fetch(uri, requestOptions);
    const body = await response.json();
    return body;
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  HeaderRow = ({ row, ...restProps }) => (
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

  onSelectionChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);
    this.setState({ selection: selection });
    this.setState({ selectedRow: this.state.clusters[selection[0]] });
  };

  onExpandedRowIdsChange = (selection) => {
    if (selection.length > 1) selection.splice(0, 1);
    return this.setState({ expandedRowIds: selection });
  };

  render() {
    const t = this.props.t;
    const columns = [
      { name: "name", title: t("nodes.pop-addNode.grid.name") },
      { name: "status", title: t("nodes.pop-addNode.grid.status") },
      { name: "provider", title: t("nodes.pop-addNode.grid.type") },
      { name: "cpu", title: t("nodes.pop-addNode.grid.cpu") },
      { name: "memory", title: t("nodes.pop-addNode.grid.memory") },
    ];
    return (
      <div>
        {this.state.openProgress ? (
          <ProgressTemp
            openProgress={this.state.openProgress}
            closeProgress={this.closeProgress}
          />
        ) : (
          ""
        )}

        <Confirm2
          confirmInfo={this.state.confirmInfo}
          confrimTarget={this.state.confrimTarget}
          confirmTargetKeyname={this.state.confirmTargetKeyname}
          confirmed={this.confirmed}
          confirmOpen={this.state.confirmOpen}
        />
        {this.state.clusters ? (
          [
            <section className="md-content">
              <div style={{ display: "flex" }}>
                <div
                  className="props"
                  style={{ width: "40%", marginRight: "10px" }}
                >
                  <p>{t("nodes.pop-addNode.newVmName")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder={t("nodes.pop-addNode.newVmName-placeholder")}
                    variant="outlined"
                    value={this.state.newVmName}
                    fullWidth={true}
                    name="newVmName"
                    onChange={this.onChange}
                  />
                </div>
                <div className="props" style={{ width: "60%" }}>
                  <p>{t("nodes.pop-addNode.newVmPasswd")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder={t("nodes.pop-addNode.newVmPasswd-placeholder")}
                    variant="outlined"
                    value={this.state.newVmPassword}
                    fullWidth={true}
                    name="newVmPassword"
                    onChange={this.onChange}
                  />
                </div>
              </div>
            </section>,
            <section className="md-content">
              <div className="outer-table">
                <p>{t("nodes.pop-addNode.grid.title")}</p>
                {/* cluster selector */}
                <Paper>
                  <Grid rows={this.state.clusters} columns={columns}>
                    {/* Sorting */}
                    <SortingState
                      defaultSorting={[
                        { columnName: "status", direction: "asc" },
                      ]}
                    />

                    {/* 페이징 */}
                    <PagingState
                      defaultCurrentPage={0}
                      defaultPageSize={this.state.pageSize}
                    />
                    <PagingPanel pageSizes={this.state.pageSizes} />

                    <SelectionState
                      selection={this.state.selection}
                      onSelectionChange={this.onSelectionChange}
                    />

                    <IntegratedFiltering />
                    <IntegratedSorting />
                    <IntegratedPaging />

                    {/* 테이블 */}
                    <Table />
                    <TableColumnResizing
                      defaultColumnWidths={this.state.defaultColumnWidths}
                    />
                    <TableHeaderRow
                      showSortingControls
                      rowComponent={this.HeaderRow}
                    />
                    <TableSelection
                      selectByRowClick
                      highlightRow
                      // showSelectionColumn={false}
                    />
                  </Grid>
                </Paper>
              </div>
            </section>,
            <section className="md-content">
              <div>
                <div className="props">
                  <p>{t("nodes.pop-addNode.templateImgVm")}</p>
                  <TextField
                    id="outlined-multiline-static"
                    rows={1}
                    placeholder={t(
                      "nodes.pop-addNode.templateImgVm-placeholder"
                    )}
                    variant="outlined"
                    value={this.state.accessKey}
                    fullWidth={true}
                    name="templateVm"
                    onChange={this.onChange}
                  />
                </div>
              </div>
            </section>,
          ]
        ) : (
          <CircularProgress
            variant="determinate"
            value={this.state.completed}
            style={{ position: "relative", left: "48%", marginTop: "10px" }}
          ></CircularProgress>
        )}
      </div>
    );
  }
}

export default withTranslation()(AddKVMNode);

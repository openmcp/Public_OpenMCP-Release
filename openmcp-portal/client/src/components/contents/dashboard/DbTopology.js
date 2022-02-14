import React, { Component } from "react";
import { Link } from "react-router-dom";
// import { withStyles } from "@material-ui/core/styles";

import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { Container } from "@material-ui/core";
// import { NavigateNext } from "@material-ui/icons";
// import { FaBuffer } from "react-icons/fa";
import DbClusterTopology from "./DbClusterTopology";
import DbServiceTopology from "./DbServiceTopology";
import DbServiceRegionTopology from "./DbServiceRegionTopology";
import { withTranslation } from "react-i18next";

// const styles = (theme) => ({
//   root: {
//     flexGrow: 1,
//     backgroundColor: theme.palette.background.paper,
//   },
// });

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Container>
          <Box>{children}</Box>
        </Container>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class DbTopology extends Component {
  state = {
    reRender: "",
    value: 0,
    tabHeader: [],
  };

  componentWillMount() {
    // const {t} = this.props;
    this.setState({
      value: 0,
      tabHeader: [
        { label: "cluster.title", index: 1, param: "cluster" },
        { label: "service.title", index: 2, param: "service" },
        { label: "region.title", index: 3, param: "region" },
      ],
    });
  }

  render() {
    const { t } = this.props;
    const handleChange = (event, newValue) => {
      this.setState({ value: newValue });
    };

    return (
      <div className="dash-comp" style={{ width: "100%" }}>
        {/* 컨텐츠 내용 */}
        <div style={{}}>
          <div className="content-box">
            <div className="cb-header" style={{ marginBottom: "0px" }}>
              <span>{t("dashboard.topology.title")}</span>
            </div>
            <div
              className="cb-body"
              style={{ position: "relative", display: "flex" }}
            >
              <section style={{ width: "100%" }}>
                <div>
                  <AppBar
                    position="static"
                    className="app-bar"
                    style={{ boxShadow: "none" }}
                  >
                    <Tabs
                      value={this.state.value}
                      onChange={handleChange}
                      aria-label="simple tabs example"
                      style={{
                        backgroundColor: "#3c8dbc",
                        minHeight: "42px",
                        width: "100%",
                        zIndex: "990",
                      }}
                      TabIndicatorProps={{
                        style: { backgroundColor: "#00d0ff" },
                      }}
                    >
                      {this.state.tabHeader.map((i) => {
                        return (
                          <Tab
                            label={t(`dashboard.topology.${i.label}`)}
                            {...a11yProps(i.index)}
                            component={Link}
                            style={{
                              minHeight: "42px",
                              fontSize: "13px",
                              minWidth: "100px",
                            }}
                          />
                        );
                      })}
                    </Tabs>
                  </AppBar>
                  <TabPanel className="" value={this.state.value} index={0}>
                    <DbClusterTopology propsData={this.props.propsData} />
                  </TabPanel>
                  <TabPanel className="" value={this.state.value} index={1}>
                    <DbServiceTopology propsData={this.props.propsData} />
                  </TabPanel>
                  <TabPanel className="" value={this.state.value} index={2}>
                    <DbServiceRegionTopology propsData={this.props.propsData} />
                  </TabPanel>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(DbTopology);

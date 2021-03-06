import React, { Component } from "react";
import { NavLink, Link, Route, Switch } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { Container } from "@material-ui/core";
import { NavigateNext } from "@material-ui/icons";
import { AiOutlineUser } from "react-icons/ai";
import { AsyncStorage } from "AsyncStorage";
import { withTranslation } from "react-i18next";
import Accounts from "./Accounts";
import UserLogs from "./UserLogs";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  // indicator: {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   backgroundColor: 'transparent',
  //   '& > span': {
  //     maxWidth: 40,
  //     width: '100%',
  //     backgroundColor: '#635ee7',
  //   },
  // },
});

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

class AccountMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // rows: "",
      // completed: 0,
      reRender: "",
      value: 0,
      tabHeader: [
        { label: "account", index: 1, param: "account" },
        { label: "userLog", index: 2, param: "user-log" },
        // { label: "DaemonSets", index: 3 },
      ],
    };
  }

  componentWillMount() {
    if (this.props.match.url.indexOf("log") > 0) {
      this.setState({ value: 1 });
    } else {
      this.setState({ value: 0 });
    }
    this.props.menuData("none");
  }

  render() {
    const { t } = this.props;
    const handleChange = (event, newValue) => {
      this.setState({ value: newValue });
    };
    const { classes } = this.props;

    let role;
    AsyncStorage.getItem("roles", (err, result) => {
      role = result;
    });

    return (
      <div>
        <div className="content-wrapper fulled">
          {/* ????????? ?????? */}
          <section className="content-header">
            <h1>
              <i>
                <AiOutlineUser />
              </i>
              <span>{t("accounts.title")}</span>
              <small>{this.props.match.params.project}</small>
            </h1>
            <ol className="breadcrumb">
              <li>
                <NavLink to="/dashboard">{t("common.nav.home")}</NavLink>
              </li>
              <li>
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {t("accounts.title")}
              </li>
              <li className="active">
                <NavigateNext
                  style={{ fontSize: 12, margin: "-2px 2px", color: "#444" }}
                />
                {this.state.tabHeader.map((i) => {
                   return(
                    this.state.value+1 === i.index ? 
                    <span>{t(`accounts.${i.label}.title`)}</span> 
                    : null
                  )
                })}
              </li>
            </ol>
          </section>

          {/* ???????????? */}
          <section>
            {/* ???????????? ????????????. */}
            <div className={classes.root}>
              <AppBar position="static" className="app-bar">
                <Tabs
                  value={this.state.value}
                  onChange={handleChange}
                  aria-label="simple tabs example"
                  style={{
                    backgroundColor: "#3c8dbc",
                    minHeight: "42px",
                    position: "fixed",
                    width: "100%",
                    zIndex: "990",
                  }}
                  TabIndicatorProps={{ style: { backgroundColor: "#00d0ff" } }}
                >
                  {this.state.tabHeader.map((i) => {
                    return (
                      <Tab
                        label={t(`accounts.${i.label}.title`)}
                        {...a11yProps(i.index)}
                        component={Link}
                        to={{
                          pathname: `/settings/accounts/${i.param}`,
                        }}
                        style={{
                          minHeight: "42px",
                          fontSize: "13px",
                          minWidth: "100px",
                          display:
                            role !== "admin" && i.index === 2 ? "none" : "",
                        }}
                      />
                    );
                  })}
                </Tabs>
              </AppBar>
              <TabPanel
                className="tab-panel"
                value={this.state.value}
                index={0}
              >
                <Switch>
                  <Route
                    path="/settings/accounts/account"
                    render={({ match, location }) => (
                      <Accounts
                        match={match}
                        location={location}
                        menuData={this.onMenuData}
                      />
                    )}
                  ></Route>
                </Switch>
              </TabPanel>
              <TabPanel
                className="tab-panel"
                value={this.state.value}
                index={1}
              >
                <Switch>
                  <Route
                    path="/settings/accounts/user-log"
                    render={({ match, location }) => (
                      <UserLogs
                        match={match}
                        location={location}
                        menuData={this.onMenuData}
                      />
                    )}
                  ></Route>
                </Switch>
              </TabPanel>
              {/* <TabPanel  className="tab-panel"value={this.state.value} index={2}>
              Item Three
            </TabPanel> */}
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default withTranslation()(withStyles(styles)(AccountMenu));

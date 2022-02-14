import React, { Component } from "react";
// import {ArrowBackIos, NavigateNext} from '@material-ui/icons';
import { Link, NavLink } from "react-router-dom";
import * as fnMenuList from "./LeftMenuData.js";
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { withTranslation } from "react-i18next";
import { NavigateBefore } from "@material-ui/icons";

class LeftMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      params: this.props.menu,
    };
  }

  componentDidMount() {}

  // shouldComponentUpdate(prevProps, prevState) {
  //   if (this.props.menu !== prevProps.menu || this.props.title !== prevProps.title){
  //     return true;
  //   } else {
  //     if(this.props.pathParams.hasOwnProperty('searchString') && this.props.pathParams.searchString !== prevProps.pathParams.searchString){
  //       return true;
  //     }
  //     return false;
  //   }
  // }

  render() {
    const { t } = this.props;
    const menuList = fnMenuList.getMenu(this.props.pathParams, t);
    const lists = [];
    menuList[this.props.menu].forEach((item) => {
      if (item.type === "single") {
        lists.push(
          <li className="">
            {/* <NavLink to={item.path} activeClassName="active"> */}
            <NavLink
              to={{
                pathname: `${item.path}`,
                search: item.searchString,
                state: {
                  data: item.state,
                },
              }}
              activeClassName="active"
            >
              <i className="fa fa-dashboard"></i>
              <span>{item.title}</span>
            </NavLink>
          </li>
        );
      } else {
        lists.push(
          <li className="treeview">
            <NavLink
              to={{
                pathname: `${item.path}`,
                search: item.searchString,
                state: {
                  data: item.state,
                },
              }}
              activeClassName="active"
            >
              <i className="fa fa-dashboard"></i>
              <span>{item.title}</span>
              <span className="pull-right-container"></span>
            </NavLink>

            <ul className="treeview-menu">
              {item.sub.map((subItem) => {
                return (
                  <li>
                    <NavLink
                      to={{
                        pathname: `${subItem.path}`,
                        search: subItem.searchString,
                        state: {
                          data: item.state,
                        },
                      }}
                      activeClassName="active"
                    >
                      <i className="fa fa-circle-o"></i>{" "}
                      <span>{subItem.title}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      }
    });
    // console.log("this.props.title", this.props.title)
    return (
      <div>
        {this.props.title !== undefined ? (
          <aside className="main-sidebar">
            <section className="sidebar">
              <div
                className="user-panel"
                style={{
                  backgroundColor: "#1e282c",
                }}
              >
                <div className="pull-left image"></div>
                <div className="pull-left info">
                  <p>
                    <Link
                      to={{
                        pathname: `/${this.props.menu}`,
                      }}
                    >
                      <NavigateBefore
                        style={{
                          fontSize: 26,
                          margin: "-9px 2px -9px -3px",
                          color: "#fff",
                        }}
                      />
                      {this.props.menu}
                      {/* {t("common.btn.prev")} */}
                    </Link>
                  </p>
                  {/* <a href="/">{this.state.createDate}</a> */}
                </div>
              </div>

              <ul className="sidebar-menu tree" data-widget="tree">
                {lists}
              </ul>
            </section>
          </aside>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default withTranslation()(LeftMenu);

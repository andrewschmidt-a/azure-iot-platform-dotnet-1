// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";

import { Route, Switch } from "react-router-dom";
import { NavLink } from "react-router-dom";

import { permissions, toDiagnosticsModel } from "services/models";
import { DeviceGroupDropdownContainer as DeviceGroupDropdown } from "components/shell/deviceGroupDropdown";
import { ManageDeviceGroupsBtnContainer as ManageDeviceGroupsBtn } from "components/shell/manageDeviceGroupsBtn";
import { TimeIntervalDropdownContainer as TimeIntervalDropdown } from "components/shell/timeIntervalDropdown";
import { ResetActiveDeviceQueryBtnContainer as ResetActiveDeviceQueryBtn } from "components/shell/resetActiveDeviceQueryBtn";
import { Notifications } from "./notifications";
import { Jobs } from "./jobs";
import {
    ComponentArray,
    ContextMenu,
    ContextMenuAlign,
    RefreshBarContainer as RefreshBar,
    PageContent,
    PageTitle,
    Protected,
    StatSection,
    StatGroup,
    StatProperty,
} from "components/shared";
import {
    svgs,
    renderUndefined,
    getDeviceGroupParam,
    getTenantIdParam,
} from "utilities";
import { CreateDeviceQueryBtnContainer as CreateDeviceQueryBtn } from "components/shell/createDeviceQueryBtn";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./summary.module.scss"));
const maintenanceCss = classnames.bind(require("../maintenance.module.scss"));

export class Summary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDeviceGroupId: undefined,
        };
    }

    UNSAFE_componentWillMount() {
        if (this.props.location && this.props.location.search) {
            const tenantId = getTenantIdParam(this.props.location);
            this.props.checkTenantAndSwitch({
                tenantId: tenantId,
                redirectUrl: window.location.href,
            });
            this.setState({
                selectedDeviceGroupId: getDeviceGroupParam(this.props.location),
            });
        }
    }

    componentDidMount() {
        if (this.state.selectedDeviceGroupId && this.props.location) {
            window.history.replaceState(
                {},
                document.title,
                this.props.location.pathname
            );
        }
    }

    tabClickHandler = (tabName) => {
        this.props.logEvent(toDiagnosticsModel(tabName + "_Click", {}));
    };

    render() {
        return (
            <ComponentArray>
                <ContextMenu>
                    <ContextMenuAlign left={true}>
                        <DeviceGroupDropdown
                            deviceGroupIdFromUrl={
                                this.state.selectedDeviceGroupId
                            }
                        />
                        <Protected permission={permissions.updateDeviceGroups}>
                            <ManageDeviceGroupsBtn />
                        </Protected>
                        {this.props.activeDeviceQueryConditions.length !== 0 ? (
                            <>
                                <CreateDeviceQueryBtn />
                                <ResetActiveDeviceQueryBtn />
                            </>
                        ) : null}
                    </ContextMenuAlign>
                    <ContextMenuAlign>
                        <TimeIntervalDropdown
                            onChange={this.props.onTimeIntervalChange}
                            value={this.props.timeInterval}
                            t={this.props.t}
                        />
                        <RefreshBar
                            refresh={this.props.refreshData}
                            time={this.props.lastUpdated}
                            isPending={
                                this.props.alertProps.isPending ||
                                this.props.jobProps.isPending
                            }
                            t={this.props.t}
                            isShowIconOnly={true}
                        />
                    </ContextMenuAlign>
                </ContextMenu>
                <PageContent
                    className={`${maintenanceCss(
                        "maintenance-container"
                    )}  ${css("summary-container")}`}
                >
                    <PageTitle titleValue={this.props.t("maintenance.title")} />
                    <StatSection className={css("summary-stat-container")}>
                        {this.props.alerting.jobState === "Running" && (
                            <StatGroup>
                                <StatProperty
                                    value={renderUndefined(
                                        this.props.alertCount
                                    )}
                                    label={this.props.t(
                                        "maintenance.openAlerts"
                                    )}
                                    size="medium"
                                />
                            </StatGroup>
                        )}
                        {this.props.alerting.jobState === "Running" && (
                            <StatGroup>
                                <StatProperty
                                    value={renderUndefined(
                                        this.props.criticalAlertCount
                                    )}
                                    label={this.props.t("maintenance.critical")}
                                    svg={svgs.critical}
                                    svgClassName={css("stat-critical")}
                                />
                                <StatProperty
                                    value={renderUndefined(
                                        this.props.warningAlertCount
                                    )}
                                    label={this.props.t("maintenance.warning")}
                                    svg={svgs.warning}
                                    svgClassName={css("stat-warning")}
                                />
                            </StatGroup>
                        )}
                        <StatGroup>
                            <StatProperty
                                value={renderUndefined(
                                    this.props.failedJobsCount
                                )}
                                label={this.props.t("maintenance.failedJobs")}
                                size="medium"
                            />
                        </StatGroup>
                        <StatGroup>
                            <StatProperty
                                value={renderUndefined(this.props.jobsCount)}
                                label={this.props.t("maintenance.total")}
                            />
                            <StatProperty
                                value={renderUndefined(
                                    this.props.succeededJobsCount
                                )}
                                label={this.props.t("maintenance.succeeded")}
                            />
                        </StatGroup>
                    </StatSection>
                    <div className={maintenanceCss("tab-container")}>
                        {this.props.alerting.jobState === "Running" && (
                            <NavLink
                                to={"/maintenance/notifications"}
                                className={maintenanceCss("tab")}
                                activeClassName={maintenanceCss("active")}
                                onClick={this.tabClickHandler.bind(
                                    this,
                                    "AlertsTab"
                                )}
                            >
                                {this.props.t("maintenance.notifications")}
                            </NavLink>
                        )}
                        <NavLink
                            to={"/maintenance/jobs"}
                            className={maintenanceCss("tab")}
                            activeClassName={maintenanceCss("active")}
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                            {this.props.t("maintenance.jobs")}
                        </NavLink>
                    </div>
                    <div className={css("grid-container")}>
                        <Switch>
                            {this.props.alerting.jobState === "Running" && (
                                <Route
                                    exact
                                    path={"/maintenance/notifications"}
                                    render={() => (
                                        <Notifications
                                            {...this.props}
                                            {...this.props.alertProps}
                                        />
                                    )}
                                />
                            )}
                            <Route
                                exact
                                path={"/maintenance/jobs"}
                                render={() => (
                                    <Jobs
                                        {...this.props}
                                        {...this.props.jobProps}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                </PageContent>
            </ComponentArray>
        );
    }
}

// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";

import { permissions, toDiagnosticsModel } from "services/models";
import { RulesGrid } from "./rulesGrid";
import { DeviceGroupDropdownContainer as DeviceGroupDropdown } from "components/shell/deviceGroupDropdown";
import { ManageDeviceGroupsBtnContainer as ManageDeviceGroupsBtn } from "components/shell/manageDeviceGroupsBtn";
import { ResetActiveDeviceQueryBtnContainer as ResetActiveDeviceQueryBtn } from "components/shell/resetActiveDeviceQueryBtn";
import {
    AjaxError,
    Btn,
    ComponentArray,
    ContextMenu,
    ContextMenuAlign,
    PageContent,
    PageTitle,
    Protected,
    RefreshBarContainer as RefreshBar,
} from "components/shared";
import { NewRuleFlyout } from "./flyouts";
import { svgs, getDeviceGroupParam, getTenantIdParam } from "utilities";
import { toSinglePropertyDiagnosticsModel } from "services/models";
import { CreateDeviceQueryBtnContainer as CreateDeviceQueryBtn } from "components/shell/createDeviceQueryBtn";
import { IdentityGatewayService } from "services";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./rules.module.scss"));

const closedFlyoutState = {
    openFlyoutName: "",
    selectedRuleId: undefined,
};

export class Rules extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...closedFlyoutState,
            contextBtns: null,
            selectedDeviceGroupId: undefined,
        };

        if (!this.props.lastUpdated && !this.props.error) {
            this.props.fetchRules();
        }

        this.props.updateCurrentWindow("Rules");

        if (this.props.applicationPermissionsAssigned !== undefined) {
            this.logApplicationPermissions(
                this.props.applicationPermissionsAssigned
            );
        }
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
        IdentityGatewayService.VerifyAndRefreshCache();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (
            nextProps.isPending &&
            nextProps.isPending !== this.props.isPending
        ) {
            // If the grid data refreshes, hide the flyout and deselect soft selections
            this.setState(closedFlyoutState);
        }
        if (
            nextProps.applicationPermissionsAssigned !== undefined &&
            nextProps.applicationPermissionsAssigned !==
                this.props.applicationPermissionsAssigned
        ) {
            this.logApplicationPermissions(
                nextProps.applicationPermissionsAssigned
            );
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

    closeFlyout = () => this.setState(closedFlyoutState);

    openNewRuleFlyout = () => {
        const { logEvent } = this.props;
        this.setState({
            openFlyoutName: "newRule",
            selectedRuleId: "",
        });
        logEvent(toDiagnosticsModel("Rule_NewClick", {}));
    };

    onGridReady = (gridReadyEvent) => (this.rulesGridApi = gridReadyEvent.api);

    onContextMenuChange = (contextBtns) => this.setState({ contextBtns });

    logApplicationPermissions(applicationPermissionsAssigned) {
        if (applicationPermissionsAssigned !== undefined) {
            this.props.logEvent(
                toSinglePropertyDiagnosticsModel(
                    "ApplicationPermissions",
                    "AssignedPermissions",
                    applicationPermissionsAssigned
                )
            );
        }
    }

    render() {
        const {
                alerting,
                t,
                rules,
                error,
                isPending,
                lastUpdated,
                fetchRules,
                logEvent,
                activeDeviceGroupId,
                location,
                userPermissions,
                currentTenantId,
            } = this.props,
            gridProps = {
                onGridReady: this.onGridReady,
                rowData: isPending ? undefined : rules || [],
                onContextMenuChange: this.onContextMenuChange,
                t: this.props.t,
                deviceGroups: this.props.deviceGroups,
                refresh: fetchRules,
                logEvent: this.props.logEvent,
                activeDeviceGroupId: activeDeviceGroupId,
                location: location,
                userPermissions: userPermissions,
                rulesGridApi: this.rulesGridApi,
                currentTenantId: currentTenantId,
            };
        return (
            <ComponentArray>
                {alerting.jobState === "Running" && (
                    <ContextMenu>
                        <ContextMenuAlign left={true}>
                            <DeviceGroupDropdown
                                deviceGroupIdFromUrl={
                                    this.state.selectedDeviceGroupId
                                }
                            />
                            <Protected
                                permission={permissions.updateDeviceGroups}
                            >
                                <ManageDeviceGroupsBtn />
                            </Protected>
                            {this.props.activeDeviceQueryConditions.length !==
                            0 ? (
                                <>
                                    <CreateDeviceQueryBtn />
                                    <ResetActiveDeviceQueryBtn />
                                </>
                            ) : null}
                        </ContextMenuAlign>
                        <ContextMenuAlign>
                            {this.state.contextBtns}
                            <Protected permission={permissions.createRules}>
                                <Btn
                                    svg={svgs.plus}
                                    onClick={this.openNewRuleFlyout}
                                >
                                    {t("rules.flyouts.newRule")}
                                </Btn>
                            </Protected>
                            <RefreshBar
                                refresh={fetchRules}
                                time={lastUpdated}
                                isPending={isPending}
                                t={t}
                                isShowIconOnly={true}
                            />
                        </ContextMenuAlign>
                    </ContextMenu>
                )}
                {alerting.jobState === "Running" && (
                    <PageContent className={css("rules-container")}>
                        <PageTitle titleValue={t("rules.title")} />
                        {!!error && <AjaxError t={t} error={error} />}
                        {!error && <RulesGrid {...gridProps} />}
                        {this.state.openFlyoutName === "newRule" && (
                            <NewRuleFlyout
                                t={t}
                                onClose={this.closeFlyout}
                                logEvent={logEvent}
                            />
                        )}
                    </PageContent>
                )}

                {alerting.jobState !== "Running" && (
                    <center>
                        <h1>Alerting must be turned on to use Rules</h1>
                        <h2>
                            You may turn this feature on by clicking the
                            settings menu (gear icon) at the top right of the
                            screen
                        </h2>
                    </center>
                )}
            </ComponentArray>
        );
    }
}

// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";

import { permissions, toDiagnosticsModel } from "services/models";
import { UsersGridContainer } from "./usersGrid";
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
import { UserNewContainer } from "./flyouts/userNew";
import { UserNewServicePrincipalContainer } from "./flyouts/userNewServicePrincipal/userNewServicePrincipal.container";
import { svgs } from "utilities";

import { SystemAdminNewContainer } from "./flyouts/systemAdminNew";
import { SystemAdminDeleteContainer } from "./flyouts/systemAdminDelete";
import { IdentityGatewayService } from "services";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./users.module.scss"));

const closedFlyoutState = { openFlyoutName: undefined };

export class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...closedFlyoutState,
            contextBtns: null,
        };

        this.props.updateCurrentWindow("Users");
    }

    UNSAFE_componentWillMount() {
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
    }

    closeFlyout = () => this.setState(closedFlyoutState);

    openNewUserFlyout = () => {
        this.setState({ openFlyoutName: "new-user" });
        this.props.logEvent(toDiagnosticsModel("Users_NewClick", {}));
    };
    openSystemAdminFlyout = () => {
        this.setState({ openFlyoutName: "new-SystemAdmin" });
        this.props.logEvent(toDiagnosticsModel("NewSystemAdmins_Click", {}));
    };
    openDeleteSystemAdminFlyout = () => {
        this.setState({ openFlyoutName: "delete-SystemAdmin" });
        this.props.logEvent(toDiagnosticsModel("DeleteSystemAdmins_Click", {}));
    };
    openNewServicePrincipalFlyout = () => {
        this.setState({ openFlyoutName: "new-sp" });
        this.props.logEvent(
            toDiagnosticsModel("ServicePrincipal_NewClick", {})
        );
    };

    onContextMenuChange = (contextBtns) =>
        this.setState({
            contextBtns,
            openFlyoutName: undefined,
        });

    onGridReady = (gridReadyEvent) => {
        this.userGridApi = gridReadyEvent.api;
        if (!this.props.users || this.props.users.length === 0) {
            this.props.fetchUsers(); // Load Users for the first time
        }
    };

    render() {
        const {
                t,
                users,
                userGroupError,
                userError,
                isPending,
                lastUpdated,
                fetchUsers,
                isSystemAdmin,
            } = this.props,
            gridProps = {
                onGridReady: this.onGridReady,
                rowData: isPending ? undefined : users || [],
                onContextMenuChange: this.onContextMenuChange,
                t: this.props.t,
                searchAreaLabel: this.props.t("users.ariaLabel"),
                searchPlaceholder: this.props.t("users.searchPlaceholder"),
            },
            newUserFlyoutOpen = this.state.openFlyoutName === "new-user",
            newServicePrincipalFlyoutOpen =
                this.state.openFlyoutName === "new-sp",
            newSystemAdminFlyoutOpen =
                this.state.openFlyoutName === "new-SystemAdmin",
            deleteSystemAdminFlyoutOpen =
                this.state.openFlyoutName === "delete-SystemAdmin",
            error = userGroupError || userError;

        return (
            <ComponentArray>
                <ContextMenu>
                    <ContextMenuAlign>
                        {this.state.contextBtns}
                        <Protected permission={permissions.inviteUsers}>
                            <Btn
                                svg={svgs.plus}
                                onClick={this.openNewUserFlyout}
                            >
                                {t("users.flyouts.new.contextMenuName")}
                            </Btn>
                        </Protected>
                        {isSystemAdmin && (
                            <Btn
                                svg={svgs.plus}
                                onClick={this.openSystemAdminFlyout}
                            >
                                {t("users.flyouts.new.systemAdmin.title")}
                            </Btn>
                        )}
                        {isSystemAdmin && (
                            <Btn
                                svg={svgs.trash}
                                onClick={this.openDeleteSystemAdminFlyout}
                            >
                                {t("users.flyouts.delete.systemAdmin.title")}
                            </Btn>
                        )}
                        <Protected permission={permissions.inviteUsers}>
                            <Btn
                                svg={svgs.plus}
                                onClick={this.openNewServicePrincipalFlyout}
                            >
                                {t("users.flyouts.new.addServicePrincipal")}
                            </Btn>
                        </Protected>
                        <RefreshBar
                            refresh={fetchUsers}
                            time={lastUpdated}
                            isPending={isPending}
                            t={t}
                            isShowIconOnly={true}
                        />
                    </ContextMenuAlign>
                </ContextMenu>
                <PageContent className={css("users-container")}>
                    <PageTitle titleValue={t("users.title")} />
                    {!!error && <AjaxError t={t} error={error} />}
                    {!error && <UsersGridContainer {...gridProps} />}
                    {newUserFlyoutOpen && (
                        <UserNewContainer onClose={this.closeFlyout} />
                    )}
                    {newSystemAdminFlyoutOpen && (
                        <SystemAdminNewContainer onClose={this.closeFlyout} />
                    )}
                    {deleteSystemAdminFlyoutOpen && (
                        <SystemAdminDeleteContainer
                            onClose={this.closeFlyout}
                        />
                    )}
                    {newServicePrincipalFlyoutOpen && (
                        <UserNewServicePrincipalContainer
                            onClose={this.closeFlyout}
                        />
                    )}
                </PageContent>
            </ComponentArray>
        );
    }
}

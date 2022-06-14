// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";

import { Link } from "react-router-dom";
import { Trans } from "react-i18next";
import { permissions } from "services/models";
import { AjaxError, Btn, BtnToolbar, Protected, Svg } from "components/shared";
import { svgs } from "utilities";
import { TelemetryService } from "services";
import { toEditRuleRequestModel } from "services/models";
import Flyout from "components/shared/flyout";
import { RuleSummaryContainer as RuleSummary } from "../ruleSummary";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./deleteRule.module.scss"));
const ruleCss = classnames.bind(
    require("../../rulesGrid/rulesGrid.module.scss")
);

export class DeleteRule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPending: false,
            error: undefined,
            changesApplied: undefined,
            confirmed: false,
            ruleDeleted: undefined,
            expandedValue: false,
        };
        this.expandFlyout = this.expandFlyout.bind(this);
    }

    componentDidMount() {
        if (this.props.rule) {
            const { rule } = this.props;
            this.setState({
                rule,
                status: !rule.enabled,
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.rule) {
            const { rule } = nextProps;
            this.setState({
                rule,
                status: !rule.enabled,
            });
        }
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onDelete = ({ target: { value } }) => {
        if (this.state.changesApplied) {
            this.setState({ status: value, changesApplied: false });
        } else {
            this.setState({ status: value });
        }
    };

    deleteRule = (event) => {
        event.preventDefault();
        const { rule } = this.state;
        this.setState({ isPending: true, error: null });
        this.subscription = TelemetryService.deleteRule(rule.id).subscribe(
            (updatedRule) => {
                this.props.refresh();
                this.setState({
                    isPending: false,
                    changesApplied: true,
                    ruleDeleted: true,
                });
            },
            (error) =>
                this.setState({ error, isPending: false, changesApplied: true })
        );
    };

    changeRuleStatus = (event) => {
        event.preventDefault();
        const { rule, status } = this.state;
        this.setState({ isPending: true, error: null });
        rule.enabled = status;
        this.subscription = TelemetryService.updateRule(
            rule.id,
            toEditRuleRequestModel(rule)
        ).subscribe(
            (updatedRule) => {
                this.props.refresh();
                this.setState({
                    isPending: false,
                    changesApplied: true,
                    ruleDeleted: false,
                });
            },
            (error) =>
                this.setState({ error, isPending: false, changesApplied: true })
        );
    };

    confirmDelete = (event) => {
        event.preventDefault();
        this.setState({
            confirmed: true,
        });
    };

    expandFlyout() {
        if (this.state.expandedValue) {
            this.setState({
                expandedValue: false,
            });
        } else {
            this.setState({
                expandedValue: true,
            });
        }
    }

    render() {
        const { onClose, t } = this.props,
            { isPending, error, changesApplied, rule } = this.state,
            completedSuccessfully = changesApplied && !error;

        return (
            <Flyout.Container
                header={t("rules.flyouts.deleteRule.title")}
                t={t}
                onClose={onClose}
                expanded={this.state.expandedValue}
                onExpand={() => {
                    this.expandFlyout();
                }}
            >
                <Protected permission={permissions.deleteRules}>
                    <form
                        onSubmit={this.deleteRule}
                        className={css("delete-rule-flyout-container")}
                    >
                        {rule && (
                            <RuleSummary
                                rule={rule}
                                isPending={isPending}
                                completedSuccessfully={completedSuccessfully}
                                t={t}
                                includeSummaryStatus={true}
                                className={css("rule-details")}
                            />
                        )}
                        {error && (
                            <AjaxError
                                className={css("rule-delete-error")}
                                t={t}
                                error={error}
                            />
                        )}
                        {!error &&
                            (changesApplied
                                ? this.renderConfirmation()
                                : this.renderButtons())}
                    </form>
                </Protected>
            </Flyout.Container>
        );
    }

    renderButtons() {
        const { confirmed } = this.state;
        return confirmed
            ? this.renderDeleteDisableButtons()
            : this.renderInitialDeleteButtons();
    }

    renderDeleteDisableButtons() {
        const { t } = this.props,
            { isPending, status, changesApplied, rule } = this.state;
        return (
            <div>
                <div className={css("delete-info")}>
                    <Svg className={css("asterisk-svg")} src={svgs.error} />
                    <div className={css("delete-info-text")}>
                        <Trans i18nKey="rules.flyouts.deleteRule.preDeleteText">
                            keep...
                            <Link to={`/maintenance/rule/${rule.id}`}>
                                {t("rules.flyouts.deleteRule.maintenancePage")}
                            </Link>
                            ...to remove
                        </Trans>
                    </div>
                </div>
                <BtnToolbar>
                    <Btn
                        primary={true}
                        disabled={!!changesApplied || isPending}
                        type="submit"
                    >
                        {t("rules.flyouts.deleteRule.delete")}
                    </Btn>
                    {!status && (
                        <Btn
                            key="disable"
                            className={ruleCss("rule-status-btn")}
                            svg={svgs.disableToggle}
                            onClick={this.changeRuleStatus}
                        >
                            <Trans i18nKey="rules.flyouts.disable">
                                Disable
                            </Trans>
                        </Btn>
                    )}
                    {this.renderCancelButton()}
                </BtnToolbar>
            </div>
        );
    }

    renderInitialDeleteButtons() {
        const { t } = this.props,
            { isPending, changesApplied } = this.state;
        return (
            <BtnToolbar>
                <Btn
                    primary={true}
                    disabled={!!changesApplied || isPending}
                    onClick={this.confirmDelete}
                >
                    {t("rules.flyouts.deleteRule.delete")}
                </Btn>
                {this.renderCancelButton()}
            </BtnToolbar>
        );
    }

    renderCancelButton() {
        const { onClose, t } = this.props;
        return (
            <Btn svg={svgs.cancelX} onClick={onClose}>
                {t("rules.flyouts.deleteRule.cancel")}
            </Btn>
        );
    }

    renderConfirmation() {
        const { onClose, t } = this.props,
            { ruleDeleted, rule } = this.state,
            confirmationKey = ruleDeleted
                ? "rules.flyouts.deleteRule.deleteConfirmation"
                : "rules.flyouts.deleteRule.disableConfirmation";
        return (
            <div>
                <div className={css("delete-confirmation")}>
                    <div className={css("delete-confirmation-text")}>
                        <Trans i18nKey={confirmationKey}>Disable</Trans>
                        <Svg
                            className={css("check-svg")}
                            src={svgs.checkmark}
                        />
                    </div>
                    {ruleDeleted && (
                        <div className={css("post-delete-info-text")}>
                            <Trans
                                i18nKey={
                                    "rules.flyouts.deleteRule.postDeleteText"
                                }
                            >
                                ...
                                <Link to={`/maintenance/rule/${rule.id}`}>
                                    {t(
                                        "rules.flyouts.deleteRule.maintenancePage"
                                    )}
                                </Link>
                                ...
                            </Trans>
                        </div>
                    )}
                </div>
                <BtnToolbar>
                    <Btn primary={true} svg={svgs.cancelX} onClick={onClose}>
                        {t("rules.flyouts.deleteRule.close")}
                    </Btn>
                </BtnToolbar>
            </div>
        );
    }
}

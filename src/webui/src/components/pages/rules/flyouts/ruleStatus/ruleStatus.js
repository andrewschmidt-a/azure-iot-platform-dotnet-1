// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { from } from "rxjs";
import { Toggle } from "@microsoft/azure-iot-ux-fluent-controls/lib/components/Toggle";

import { AjaxError, Btn, BtnToolbar, Protected } from "components/shared";
import { svgs } from "utilities";
import { TelemetryService } from "services";
import { permissions, toEditRuleRequestModel } from "services/models";
import Flyout from "components/shared/flyout";
import { RuleSummaryContainer as RuleSummary } from "../ruleSummary";
import { mergeMap, map } from "rxjs/operators";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./ruleStatus.module.scss"));

export class RuleStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPending: false,
            error: undefined,
            changesApplied: undefined,
            expandedValue: false,
        };
        this.expandFlyout = this.expandFlyout.bind(this);
    }

    componentDidMount() {
        const { rules } = this.props;
        this.setState({
            rules,
            status: rules.length === 1 ? !rules[0].enabled : false,
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { rules } = nextProps;
        this.setState({
            rules,
            status: rules.length === 1 ? !rules[0].enabled : false,
        });
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onToggle = (value) => {
        if (this.state.changesApplied) {
            this.setState({ status: value, changesApplied: false });
        } else {
            this.setState({ status: value });
        }
    };

    changeRuleStatus = (event) => {
        event.preventDefault();
        const { rules, status } = this.state;
        this.setState({ isPending: true, error: null });
        const requestPropList = rules.map((rule) => ({
            ...rule,
            enabled: status,
        }));
        this.subscription = from(requestPropList)
            .pipe(
                mergeMap((rule) =>
                    TelemetryService.updateRule(
                        rule.id,
                        toEditRuleRequestModel(rule)
                    ).pipe(
                        map((updatedRule) => ({
                            ...rule,
                            eTag: updatedRule.eTag,
                        }))
                    )
                )
            )
            .subscribe(
                (updatedRule) => {
                    this.props.modifyRules([updatedRule]);
                    this.setState({ isPending: false, changesApplied: true });
                },
                (error) =>
                    this.setState({
                        error,
                        isPending: false,
                        changesApplied: true,
                    })
            );
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
        const { onClose, t, rules } = this.props,
            { isPending, status, error, changesApplied } = this.state,
            completedSuccessfully = changesApplied && !error;

        return (
            <Flyout.Container
                header={t("rules.flyouts.statusTitle")}
                t={t}
                onClose={onClose}
                expanded={this.state.expandedValue}
                onExpand={() => {
                    this.expandFlyout();
                }}
            >
                <Protected permission={permissions.updateRules}>
                    <form
                        onSubmit={this.changeRuleStatus}
                        className={css("disable-rule-flyout-container")}
                    >
                        <div className={css("padded-top-bottom")}>
                            <Toggle
                                name="rules-flyouts-status-enable"
                                attr={{
                                    button: {
                                        "aria-label": t(
                                            "rules.flyouts.statusToggle"
                                        ),
                                    },
                                }}
                                on={status}
                                onChange={this.onToggle}
                                onLabel={t("rules.flyouts.enable")}
                                offLabel={t("rules.flyouts.disable")}
                            />
                        </div>
                        {rules.map((rule, idx) => (
                            <RuleSummary
                                key={idx}
                                rule={rule}
                                isPending={isPending}
                                completedSuccessfully={completedSuccessfully}
                                includeSummaryStatus={true}
                                t={t}
                            />
                        ))}

                        {error && (
                            <AjaxError
                                className={css("rule-status-error")}
                                t={t}
                                error={error}
                            />
                        )}
                        {
                            <BtnToolbar>
                                <Btn
                                    primary={true}
                                    disabled={!!changesApplied || isPending}
                                    type="submit"
                                >
                                    {t("rules.flyouts.ruleEditor.apply")}
                                </Btn>
                                <Btn svg={svgs.cancelX} onClick={onClose}>
                                    {t("rules.flyouts.ruleEditor.cancel")}
                                </Btn>
                            </BtnToolbar>
                        }
                    </form>
                </Protected>
            </Flyout.Container>
        );
    }
}

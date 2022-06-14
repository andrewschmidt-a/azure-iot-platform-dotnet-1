// Copyright (c) Microsoft. All rights reserved.

import React from "react";
import { Trans } from "react-i18next";

import { permissions } from "services/models";

import { LinkedComponent, svgs } from "utilities";

import {
    FormControl,
    Btn,
    BtnToolbar,
    Protected,
    Hyperlink,
} from "components/shared";

import Flyout from "components/shared/flyout";
import { CssClassApplier } from "ag-grid-community";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./SIMManagement.module.scss"));

const Section = Flyout.Section,
    simManagementUrl = "https://iot.telefonica.com/contact",
    optionValues = [{ value: "telefonica" }];

export class SIMManagement extends LinkedComponent {
    constructor(props) {
        super(props);

        this.state = {
            provider: "",
            isPending: false,
            expandedValue: false,
        };

        this.providerLink = this.linkTo("provider").map(({ value }) => value);
        this.expandFlyout = this.expandFlyout.bind(this);
    }

    showProvider = () => this.setState({ isPending: true });

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
        const { t, onClose } = this.props,
            { provider, isPending } = this.state,
            options = optionValues.map(({ value }) => ({
                label: t(`devices.flyouts.SIMManagement.operator.${value}`),
                value,
            }));

        return (
            <Flyout.Container
                header={t("devices.flyouts.SIMManagement.title")}
                t={t}
                onClose={onClose}
                expanded={this.state.expandedValue}
                onExpand={() => {
                    this.expandFlyout();
                }}
            >
                <div className={CssClassApplier("sim-management-container")}>
                    <Protected permission={permissions.updateSIMManagement}>
                        <div className={css("sim-management-selector")}>
                            <div
                                className={css("sim-management-label-selector")}
                            >
                                {t("devices.flyouts.SIMManagement.provider")}
                            </div>
                            <div className={css("sim-management-dropdown")}>
                                <FormControl
                                    type="select"
                                    ariaLabel={t(
                                        "devices.flyouts.SIMManagement.provider"
                                    )}
                                    className={css("sim-management-dropdown")}
                                    options={options}
                                    searchable={false}
                                    clearable={false}
                                    placeholder={t(
                                        "devices.flyouts.SIMManagement.select"
                                    )}
                                    link={this.providerLink}
                                />
                            </div>
                        </div>
                        {!!provider && (
                            <Section.Container
                                className={css("hide-border")}
                                collapsable={false}
                            >
                                <Section.Header>
                                    {t(
                                        "devices.flyouts.SIMManagement.summaryHeader"
                                    )}
                                </Section.Header>
                                <Section.Content>
                                    <div>
                                        {t(
                                            `devices.flyouts.SIMManagement.header.${provider}`
                                        )}
                                    </div>
                                    <div
                                        className={css(
                                            "sim-management-label-desctiption"
                                        )}
                                    >
                                        <Trans
                                            i18nKey={`devices.flyouts.SIMManagement.description.${provider}`}
                                        >
                                            Feature is...{" "}
                                            <Hyperlink
                                                href={simManagementUrl}
                                                target="_blank"
                                            >
                                                {t(
                                                    "devices.flyouts.SIMManagement.here"
                                                )}
                                            </Hyperlink>{" "}
                                            ...your account.
                                        </Trans>
                                    </div>
                                </Section.Content>
                            </Section.Container>
                        )}
                        <BtnToolbar>
                            {!isPending && (
                                <Btn
                                    primary={true}
                                    disabled={!provider}
                                    onClick={this.showProvider}
                                    type="submit"
                                >
                                    {t("devices.flyouts.new.apply")}
                                </Btn>
                            )}
                            <Btn svg={svgs.cancelX} onClick={onClose}>
                                {isPending
                                    ? t("devices.flyouts.new.close")
                                    : t("devices.flyouts.new.cancel")}
                            </Btn>
                        </BtnToolbar>
                    </Protected>
                </div>
            </Flyout.Container>
        );
    }
}

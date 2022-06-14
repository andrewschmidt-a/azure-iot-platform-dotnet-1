// Copyright (c) Microsoft. All rights reserved.

import React from "react";

import { LinkedComponent } from "utilities";
import {
    permissions,
    toDiagnosticsModel,
    toSinglePropertyDiagnosticsModel,
} from "services/models";
import {
    ComponentArray,
    Flyout,
    ErrorMsg,
    FormGroup,
    FormLabel,
    Protected,
    Radio,
} from "components/shared";
import {
    DeviceJobTagsContainer,
    DeviceJobMethodsContainer,
    DeviceJobPropertiesContainer,
} from "./";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./deviceJobs.module.scss"));

export class DeviceJobs extends LinkedComponent {
    constructor(props) {
        super(props);
        this.state = {
            isPending: false,
            error: undefined,
            successCount: 0,
            changesApplied: false,
            formData: {
                jobType: "tags",
            },
            expandedValue: false,
        };

        // Linked components
        this.formDataLink = this.linkTo("formData");

        this.jobTypeLink = this.formDataLink.forkTo("jobType");
        this.expandFlyout = this.expandFlyout.bind(this);
    }

    componentDidMount() {
        this.props.logEvent(toDiagnosticsModel("Devices_NewJob_Click", {}));
    }

    onJobTypeChange = ({ target: { value } }) => {
        this.props.logEvent(
            toSinglePropertyDiagnosticsModel(
                "Devices_JobType_Select",
                "JobType",
                value
            )
        );
    };

    formIsValid() {
        return [this.jobTypeLink].every((link) => !link.error);
    }

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
        const {
            t,
            onClose,
            devices,
            updateTags,
            updateProperties,
            openPropertyEditorModal,
            flyoutLink,
        } = this.props;

        return (
            <Flyout
                header={t("devices.flyouts.jobs.title")}
                t={t}
                onClose={onClose}
                expanded={this.state.expandedValue}
                onExpand={() => {
                    this.expandFlyout();
                }}
                flyoutLink={flyoutLink}
            >
                <Protected permission={permissions.createJobs}>
                    <div className={css("device-jobs-container")}>
                        {devices.length === 0 && (
                            <ErrorMsg className={css("device-jobs-error")}>
                                {t("devices.flyouts.jobs.noDevices")}
                            </ErrorMsg>
                        )}
                        {devices.length > 0 && (
                            <ComponentArray>
                                <FormGroup>
                                    <FormLabel>
                                        {t("devices.flyouts.jobs.selectJob")}
                                    </FormLabel>
                                    <Radio
                                        link={this.jobTypeLink}
                                        value="tags"
                                        onClick={this.onJobTypeChange}
                                    >
                                        {t(
                                            "devices.flyouts.jobs.tags.radioLabel"
                                        )}
                                    </Radio>
                                    <Radio
                                        link={this.jobTypeLink}
                                        value="methods"
                                        onClick={this.onJobTypeChange}
                                    >
                                        {t(
                                            "devices.flyouts.jobs.methods.radioLabel"
                                        )}
                                    </Radio>
                                    <Radio
                                        link={this.jobTypeLink}
                                        value="properties"
                                        onClick={this.onJobTypeChange}
                                    >
                                        {t(
                                            "devices.flyouts.jobs.properties.radioLabel"
                                        )}
                                    </Radio>
                                </FormGroup>
                                {this.jobTypeLink.value === "tags" ? (
                                    <DeviceJobTagsContainer
                                        t={t}
                                        onClose={onClose}
                                        devices={devices}
                                        updateTags={updateTags}
                                    />
                                ) : null}
                                {this.jobTypeLink.value === "methods" ? (
                                    <DeviceJobMethodsContainer
                                        t={t}
                                        onClose={onClose}
                                        devices={devices}
                                    />
                                ) : null}
                                {this.jobTypeLink.value === "properties" ? (
                                    <DeviceJobPropertiesContainer
                                        t={t}
                                        onClose={onClose}
                                        devices={devices}
                                        updateProperties={updateProperties}
                                        openPropertyEditorModal={
                                            openPropertyEditorModal
                                        }
                                    />
                                ) : null}
                            </ComponentArray>
                        )}
                    </div>
                </Protected>
            </Flyout>
        );
    }
}

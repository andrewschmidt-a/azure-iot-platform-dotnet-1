// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {
    redux as appRedux,
    getTheme,
    getVersion,
    getLogo,
    isDefaultLogo,
    getName,
    getReleaseNotes,
    setLogoError,
    setLogoPendingStatus,
    getDiagnosticsOptIn,
    getSolutionSettingsError,
    getSolutionSettingsPendingStatus,
    getAlerting,
    getGrafanaUrl,
    getGrafanaOrgId,
    getUser,
} from "store/reducers/appReducer";
import {
    isSimulationEnabled,
    getSimulationEtag,
    getSimulationPendingStatus,
    getToggleSimulationError,
    getToggleSimulationPendingStatus,
    getSimulationError,
} from "store/reducers/deviceSimulationReducer";
import { Settings } from "./settings";
import { epics as appEpics } from "store/reducers/appReducer";
import { epics as simulationEpics } from "store/reducers/deviceSimulationReducer";

const mapStateToProps = (state) => ({
        theme: getTheme(state),
        version: getVersion(state),
        logo: getLogo(state),
        name: getName(state),
        alerting: getAlerting(state),
        isDefaultLogo: isDefaultLogo(state),
        releaseNotesUrl: getReleaseNotes(state),
        isSimulationEnabled: isSimulationEnabled(state),
        simulationEtag: getSimulationEtag(state),
        simulationTogglePending: getToggleSimulationPendingStatus(state),
        simulationToggleError: getToggleSimulationError(state),
        setLogoPending: setLogoPendingStatus(state),
        setLogoError: setLogoError(state),
        getSimulationPending: getSimulationPendingStatus(state),
        getSimulationError: getSimulationError(state),
        diagnosticsOptIn: getDiagnosticsOptIn(state),
        getDiagnosticsError: getSolutionSettingsError(state),
        getDiagnosticsPending: getSolutionSettingsPendingStatus(state),
        grafanaUrl: getGrafanaUrl(state),
        grafanaOrgId: getGrafanaOrgId(state),
        user: getUser(state),
    }),
    mapDispatchToProps = (dispatch) => ({
        changeTheme: (theme) => dispatch(appRedux.actions.changeTheme(theme)),
        updateDiagnosticsOptIn: (diagnosticsOptIn) =>
            dispatch(appEpics.actions.updateDiagnosticsOptIn(diagnosticsOptIn)),
        updateLogo: (logo, headers) =>
            dispatch(appEpics.actions.updateLogo({ logo, headers })),
        getSimulationStatus: () =>
            dispatch(simulationEpics.actions.fetchSimulationStatus()),
        toggleSimulationStatus: (etag, enabled) =>
            dispatch(
                simulationEpics.actions.toggleSimulationStatus({
                    etag,
                    enabled,
                })
            ),
        logEvent: (diagnosticsModel) =>
            dispatch(appEpics.actions.logEvent(diagnosticsModel)),
        updateAlerting: (alerting) =>
            dispatch(appEpics.actions.updateAlerting(alerting)),
    });

export const SettingsContainer = withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(Settings)
);

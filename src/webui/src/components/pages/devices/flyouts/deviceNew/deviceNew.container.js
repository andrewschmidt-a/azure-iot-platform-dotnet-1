// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { DeviceNew } from "./deviceNew";
import {
    epics as simulationEpics,
    getSimulationDeviceModelOptions,
} from "store/reducers/deviceSimulationReducer";
import {
    epics as devicesEpics,
    redux as devicesRedux,
} from "store/reducers/devicesReducer";
import { epics as appEpics } from "store/reducers/appReducer";

// Pass the global info needed
const mapStateToProps = (state) => ({
        deviceModelOptions: getSimulationDeviceModelOptions(state),
    }),
    // Wrap the dispatch method
    mapDispatchToProps = (dispatch) => ({
        fetchDeviceModelOptions: () =>
            dispatch(
                simulationEpics.actions.fetchSimulationDeviceModelOptions()
            ),
        insertDevices: (devices) =>
            dispatch(devicesRedux.actions.insertDevices(devices)),
        fetchDeviceStatistics: () =>
            dispatch(devicesEpics.actions.fetchDeviceStatistics()),
        fetchDevices: () => dispatch(devicesEpics.actions.fetchDevices()),
        logEvent: (diagnosticsModel) =>
            dispatch(appEpics.actions.logEvent(diagnosticsModel)),
    });

export const DeviceNewContainer = withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(DeviceNew)
);

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { clone } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { deleteJsonDocument, fetchJsonDocument, fetchJsonDocuments, postJsonDocuments } from '../../api';
import AuthService from '../../Auth/AuthService';
import GeneralDialog from '../../common/GeneralDialog/GeneralDialog';
import GeneralDialogProps from '../../common/GeneralDialog/types';
import { cancelJob, executeJob, fetchScenariosByDate, updateScenario } from '../../DataServices/DataServices';
import { JobParameters } from '../../DataServices/types';
import { checkCondition, getObjectProperty, setObjectProperty, uniqueId } from '../../utils/Utils';
import { ScenarioList } from '../ScenarioList/ScenarioList';
import { MenuItem, QueryDates, Scenario } from '../types';
import ScenariosProps from './types';
import useStyles from './useStyles';

const NOTIFICATION_HUB = '/notificationhub';

const Scenarios = (props: ScenariosProps) => {
  const {
    host,
    token,
    scenarioConnection,
    queryBody,
    nameField,
    jobConnection,
    jobParameters,
    module,
    dataFilterbyProperty,
    taskId,
    hostGroup,
    descriptionFields,
    extraFields,
    menuItems,
    selectedScenarioId,
    showDate,
    showHour,
    showMenu,
    showStatus,
    status,
    queryDates,
    onContextMenuClick,
    onScenarioSelected,
    onScenarioReceived,
    onScenariosReceived,
    addScenario,
    translations,
    timeZone,
  } = props;

  const [dialog, setDialog] = useState<GeneralDialogProps>();
  const [scenarios, setScenarios] = useState<Scenario[]>();
  const [scenario, setScenario] = useState<Scenario>();
  const classes = useStyles();
  const latestScenarios = useRef(null);

  latestScenarios.current = scenarios;

  useEffect(() => {
    if (addScenario !== scenario) {
      let newScenario: Scenario;

      if (addScenario!.data) {
        newScenario = clone(addScenario) as Scenario;

        newScenario = {
          ...newScenario,
          data: addScenario!.data,
        };
      } else {
        newScenario = {
          data: JSON.stringify(addScenario),
        };
      }

      setScenario(newScenario);
      onAddScenario(newScenario);
    }
  }, [addScenario]);

  const fetchScenariosByDateList = (queryDates: QueryDates) => {
    fetchScenariosByDate(
      {
        host,
        connection: scenarioConnection,
        from: queryDates.from,
        to: queryDates.to,
        dataSelectors: [
          nameField,
          ...descriptionFields!.map((descriptionField) => descriptionField.field),
          ...extraFields!.map((descriptionField) => descriptionField.field),
        ],
      },
      token,
    ).subscribe(
      (res) => {
        const rawScenarios = res.map((s: { data: string }) => {
          s.data = s.data ? JSON.parse(s.data) : s.data;

          return s;
        });

        const newScenarios = rawScenarios.filter((scenario) => checkCondition(scenario, dataFilterbyProperty));

        setScenarios(newScenarios);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  const fetchScenariosList = () => {
    fetchJsonDocuments(
      {
        host,
        connection: scenarioConnection,
      },
      token,
    ).subscribe(
      (res) => {
        const rawScenarios = res.map((s: { data: string }) => {
          s.data = s.data ? JSON.parse(s.data) : s.data;

          return s;
        });

        const newScenarios = rawScenarios.filter((scenario) => checkCondition(scenario, dataFilterbyProperty));

        setScenarios(newScenarios);

        if (onScenariosReceived) {
          onScenariosReceived(rawScenarios);
        }
      },
      (error) => {
        console.log(error);
      },
    );
  };

  const onAddScenario = (newScenario: Scenario) => {
    if (newScenario) {
      postJsonDocuments(
        {
          host,
          connection: scenarioConnection,
        },
        token,
        newScenario,
      ).subscribe((res) => res && fetchScenariosList());
    }
  };

  const onExecuteScenario = (scenario: Scenario, menuItem: MenuItem) => {
    closeDialog();

    // Define Job Parameter with ScenarioId
    const parameters = {
      ScenarioId: scenario.fullName,
    } as JobParameters;

    // Append Job Parameters from Menu Item
    if (menuItem.jobParameters) {
      for (const key in menuItem.jobParameters) {
        parameters[key] = getObjectProperty(scenario, menuItem.jobParameters[key]);
      }
    }

    // Append Job Parameters Props
    Object.assign(parameters, jobParameters);

    executeJob(
      {
        host,
        connection: menuItem.connection || jobConnection,
      },
      token,
      menuItem.taskId || taskId,
      parameters,
      menuItem.hostGroup || hostGroup,
    ).subscribe((job) => {
      const newScenarios = scenarios.map((sce) =>
        sce.fullName === job.parameters.ScenarioId && job.status === 'InProgress'
          ? { ...sce, lastJobId: job.id }
          : { ...sce },
      );

      setScenarios(newScenarios);
    });
  };

  const onTerminateScenario = (scenario: Scenario, menuItem: MenuItem) => {
    closeDialog();

    cancelJob(
      {
        host,
        connection: menuItem.connection || jobConnection,
      },
      token,
      scenario.lastJobId,
    ).subscribe(
      (res) =>
        res &&
        updateScenario(
          {
            host,
            connection: scenarioConnection,
          },
          token,
          {
            id: scenario.fullName,
            lastJobId: res.id,
            data: JSON.stringify(scenario.data),
          },
        ).subscribe((res) => res && fetchScenariosList()),
    );
  };

  const onCloneScenario = (scenario: Scenario) => {
    closeDialog();
    const clonedScenario = {
      ...scenario,
      fullName: `scenario-${uniqueId()}`,
    };
    const clonedNamed = `Clone of ${getObjectProperty(scenario.data, nameField)}`;
    setObjectProperty(clonedScenario.data, nameField, clonedNamed);

    clonedScenario.data = JSON.stringify(clonedScenario.data);

    postJsonDocuments(
      {
        host,
        connection: scenarioConnection,
      },
      token,
      clonedScenario,
    ).subscribe((res) => res && fetchScenariosList());
  };

  const getScenario = (id: string, resultCallback: (data: any) => void) => {
    fetchJsonDocument(
      {
        host,
        connection: scenarioConnection,
      },
      token,
      id,
    ).subscribe(
      (res) => {
        res.data = res.data ? JSON.parse(res.data) : res.data;
        resultCallback(res);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  const executeDialog = (scenario: Scenario, menuItem: MenuItem) => {
    const job = getObjectProperty(scenario.data, nameField);

    setDialog({
      dialogId: 'execute',
      showDialog: true,
      title: `${menuItem.label} ${job}`,
      message:
        translations && translations.executeConfirmation
          ? translations.executeConfirmation.replace('%job%', job)
          : `This will start a new job in the background. The status will change after job completion. Are you sure you want to execute ${job}?`,
      cancelLabel: translations?.cancelLabel || 'Cancel',
      confirmLabel: translations?.confirmLabel || 'Confirm',
      onConfirm: () => onExecuteScenario(scenario, menuItem),
    });
  };

  const terminateDialog = (scenario: Scenario, menuItem: MenuItem) => {
    const job = getObjectProperty(scenario.data, nameField);

    setDialog({
      dialogId: 'terminate',
      showDialog: true,
      title: `${menuItem.label} ${job}`,
      message:
        translations && translations.terminateConfirmation
          ? translations.terminateConfirmation.replace('%job%', job)
          : `This will cancel the job currently executing. The status will change after job cancelation. Are you sure you want to terminate ${job}?`,
      cancelLabel: translations?.cancelLabel || 'Cancel',
      confirmLabel: translations?.confirmLabel || 'Confirm',
      onConfirm: () => onTerminateScenario(scenario, menuItem),
    });
  };

  const cloneDialog = (scenario: Scenario) => {
    const job = getObjectProperty(scenario.data, nameField);

    setDialog({
      dialogId: 'clone',
      showDialog: true,
      title: `${translations?.cloneTitle || 'Clone'} ${job}`,
      message:
        translations && translations.cloneConfirmation
          ? translations.cloneConfirmation.replace('%job%', job)
          : `This will start a new job in the background. You can delete this cloned scenario later. Are you sure you want to clone ${job}?`,
      cancelLabel: translations?.cancelLabel || 'Cancel',
      confirmLabel: translations?.confirmLabel || 'Confirm',
      onConfirm: () => onCloneScenario(scenario),
    });
  };

  const deleteDialog = (scenario: Scenario) => {
    const job = getObjectProperty(scenario.data, nameField);

    setDialog({
      dialogId: 'delete',
      showDialog: true,
      title: `${translations?.deleteTitle || 'Delete'} ${job}`,
      message:
        translations && translations.deleteConfirmation
          ? translations.deleteConfirmation.replace('%job%', job)
          : `This will delete the selected scenario from the list. After it is deleted you cannot retrieve the data. Are you sure you want to delete ${job}?`,
      cancelLabel: translations?.cancelLabel || 'Cancel',
      confirmLabel: translations?.confirmLabel || 'Confirm',
      onConfirm: () => onDeleteScenario(scenario),
    });
  };

  const onDeleteScenario = (scenario: Scenario) => {
    closeDialog();

    deleteJsonDocument(
      {
        host,
        connection: scenarioConnection,
      },
      token,
      scenario.fullName,
    ).subscribe((res) => res.ok && fetchScenariosList());
  };

  const closeDialog = () => {
    setDialog({
      ...dialog,
      showDialog: false,
    });
  };

  const onContextMenuClickHandler = (menuItem: MenuItem, scenario: Scenario) => {
    getScenario(scenario.fullName!, (res) => {
      switch (menuItem.id) {
        case 'execute':
          return executeDialog(res, menuItem);
        case 'delete':
          return deleteDialog(res);
        case 'clone':
          return cloneDialog(res);
        case 'terminate':
          return terminateDialog(
            {
              ...res,
              lastJobId: scenario.lastJobId,
            },
            menuItem,
          );
        default:
          return onContextMenuClick(menuItem, res);
      }
    });
  };

  const onScenarioSelectedHandler = (scenario: Scenario) => {
    onScenarioSelected(scenario);

    getScenario(scenario.fullName!, (res) => onScenarioReceived(res));
  };

  const JsonDocumentAddedScenario = (added) => {
    console.log({ added });
    setScenarios([...scenarios, added]);
  };

  const JsonDocumentUpdatedScenario = (updated) => {
    console.log({ updated });
  };

  const JsonDocumentDeletedScenario = (deleted) => {
    console.log({ deleted });
  };

  const jobUpdated = (jobAdded) => {
    const job = JSON.parse(jobAdded.data);
    console.log({ job });
    console.log({ latestScenarios });
    const updateScenario = latestScenarios.current.map((scenario) => scenario.fullName === job.Parameters.ScenarioId);
    //   scenario.fullName === job.Parameters.ScenarioId ? { ...scenario, lastJobStatus: job.Status } : { ...scenario },
    // );
    setScenarios([...latestScenarios.current, updateScenario]);

    // postJsonDocuments(
    //   {
    //     host,
    //     connection: scenarioConnection,
    //   },
    //   token,
    //   updateScenario,
    // );
  };

  // data Model from old Scenario component

  // data:
  // mooring:
  //    berthName: "VIG Berth 2"
  // __proto__: Object
  // name: "My Scenario 10/02/2021 4:46:37 PM"
  // startTime: "2021-02-10T16:46:37.7598785+11:00"
  // vessel:
  // vesselName: "MSC Pamela"
  // __proto__: Object
  // __proto__: Object
  // dateTime: "2021-02-10T05:46:37.77549"
  // id: "20210210054637-1190d916-9855-4c33-b54b-909b9ac73a2a"
  // lastJobId: "e01d2ab6-f086-4f40-b515-86ada16bb74b"
  // lastJobStatus: "Completed"
  // version: "d8651e4f-db5c-4008-a550-cd0f8d501d8d"

  const connectToSignalR = async () => {
    const auth = new AuthService(process.env.ENDPOINT_URL);
    const session = auth.getSession();

    // Open connections
    try {
      if (!auth) {
        throw new Error('Not Authorised.');
      }

      const connection = new HubConnectionBuilder()
        .withUrl(process.env.ENDPOINT_URL + NOTIFICATION_HUB, {
          accessTokenFactory: () => session.accessToken,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      connection
        .start()
        .then(() => {
          console.log('SignalR Connected');
          connection.on('JsonDocumentAdded', JsonDocumentAddedScenario);
          connection.on('JsonDocumentUpdated', JsonDocumentUpdatedScenario);
          connection.on('JsonDocumentDeleted', JsonDocumentDeletedScenario);

          connection.on('JobUpdated', jobUpdated);

          connection.invoke('AddJobFilter', 'wf-jobs', []);
          connection.invoke('AddJsonDocumentFilter', scenarioConnection, []);
        })
        .catch((e) => console.log('Connection failed: ', e));
    } catch (err) {
      console.log('SignalR connection failed: ', err);
    }
  };

  useEffect(() => {
    connectToSignalR();
    fetchScenariosList();
  }, []);

  return (
    <div className={classes && classes.root}>
      {scenarios && (
        <ScenarioList
          nameField={nameField}
          descriptionFields={descriptionFields}
          extraFields={extraFields}
          menuItems={menuItems}
          scenarios={scenarios as any}
          selectedScenarioId={selectedScenarioId}
          onScenarioSelected={onScenarioSelectedHandler}
          onContextMenuClick={onContextMenuClickHandler}
          showDate={showDate}
          showHour={showHour}
          showMenu={showMenu}
          showStatus={showStatus}
          status={status}
          timeZone={timeZone}
        />
      )}
      {dialog && (
        <GeneralDialog
          dialogId={dialog.dialogId}
          title={dialog.title}
          message={dialog.message}
          cancelLabel={dialog.cancelLabel}
          confirmLabel={dialog.confirmLabel}
          showDialog={dialog.showDialog}
          onConfirm={dialog.onConfirm}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
};

export { ScenariosProps, Scenarios };

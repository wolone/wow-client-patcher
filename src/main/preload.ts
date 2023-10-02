/* eslint-disable no-console */
import { contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';
import Channels from '../constants';
import { LauncherServer } from '../typings';

const IPCApi: LauncherServer.Api = {
  Launch: () => {
    console.info('Launching WoW client');
    ipcRenderer.send(Channels.WOW_LAUNCH);
  },

  OnExitApp: (handler) => {
    ipcRenderer.on(Channels.WOW_CLIENT_EXIT, handler);
  },
  OnLaunchError: (handler) => {
    ipcRenderer.on(
      Channels.WOW_LAUNCH_ERROR,
      (event: any, error: ErrorEvent) => {
        log.info(
          `WoW client exited with Error: [${error.type}]: ${error.message}`
        );
        handler(event, error);
        ipcRenderer.removeAllListeners(Channels.WOW_LAUNCH_ERROR);
      }
    );
  },
  GetAppInfo: async () => {
    try {
      const appInfo = await ipcRenderer.invoke(Channels.APP_INFO);
      return appInfo;
    } catch (error: any) {
      const msg = `Error getting app info: ${error}`;
      log.error(msg);

      return {
        type: 'Parse',
        message: msg,
      } as ErrorEvent;
    }
  },

  GetInstalledPatches: async (type: string) => {
    try {
      const installDetails = await ipcRenderer.invoke(
        Channels.APP_API,
        { method: 'GetInstalledPatches', type }
      );
      return installDetails;
    } catch (error: any) {
      const msg = `Error getting install details: ${error}`;
      log.error(msg);

      return {
        type: 'Parse',
        message: msg,
      } as ErrorEvent;
    }
  }

};

contextBridge.exposeInMainWorld('api', IPCApi);
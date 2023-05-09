// @ts-check

import { defineConfig, test, expect } from '@playwright/test';
import dotenv from 'dotenv';
const { DeviceListPage } = require('../pages/deviceList');
const { AddDevicePage } = require('../pages/addDevice');
const { DeviceApi } = require('../api/deviceApi');
let deviceListPage;
let deviceApi;
// Read from default ".env" file.
dotenv.config();

export default defineConfig({
  use: {
    actionTimeout: 60 * 10000,
    navigationTimeout: 60 * 10000,
    timeout: 60 * 10000,
  },
});

test.beforeEach(async ({ page }) => {
  deviceListPage = new DeviceListPage(page);
  deviceApi = new DeviceApi();
  await deviceListPage.goto();
});

test.describe('Device Tests',  () => {
  test('1 - Validate device list', async () => {

    const expectedDevices = await deviceApi.getDeviceList();

    const actualDeviveList = await deviceListPage.getDeviceList()

    expect(actualDeviveList.length).toBeGreaterThan(0);

    for (const expectedDevice of expectedDevices) {
      await deviceListPage.validateDevice(expectedDevice.name, expectedDevice.capacity, expectedDevice.type);
    };
  });

  test('2 - Add device', async ({page}) => {
    const addDevicePage = new AddDevicePage(page);
    await deviceListPage.clickOnAddDevice();
    const newDeviceName = `Device ${new Date().valueOf()}`;
    await addDevicePage.addDevice(newDeviceName, "10", "MAC");
    await deviceListPage.validateDevice(newDeviceName, "10", "MAC");
  });
  
  test('3 - Update device', async () => {
    const oldDeviceName = `Device ${new Date().valueOf()}`;
    const deviceToUpdate = await deviceApi.addDevice(oldDeviceName, "10", "MAC");
    const newDeviceName = `Device ${new Date().valueOf()}`;
    await deviceApi.updateDevice(deviceToUpdate.id, newDeviceName, deviceToUpdate.capacity, deviceToUpdate.type);
    await deviceListPage.goto();
    await deviceListPage.validateDevice(newDeviceName, deviceToUpdate.capacity, deviceToUpdate.type);
  });

  test('4 - Remove device', async () => {
    const deviceToRemove = await deviceListPage.getLastDevice();
    await deviceApi.removeDevice(deviceToRemove.id);
    await deviceListPage.goto();
    await deviceListPage.validateDeviceIsNotPresent(deviceToRemove.id, deviceToRemove.name);
  });

});

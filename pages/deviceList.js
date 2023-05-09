import { expect, defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

export default defineConfig({
    use: {
      actionTimeout: 60 * 10000,
      navigationTimeout: 60 * 10000,
      timeout: 60 * 10000,
    },
});

exports.DeviceListPage = class DeviceListPage {

    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        dotenv.config();
        this.homeUrl = process.env.SITE_URL || "http://localhost:3001/";
        this.page = page;
        this.devives = page.locator('.device-main-box');
        this.addDevice = page.getByText("ADD DEVICE");
        this.apiBaseiUrl = process.env.API_URL || "http://localhost:3000/";
        this.lastDevice = page.locator('.device-main-box:last-child');
    }

    async goto() {
        await this.page.goto(this.homeUrl);
    }

    async getDeviceList() {
        return this.devives.all();
    }

    async clickOnAddDevice() {
        await this.addDevice.click();
        this.page.getByText("NEW DEVICE");
    }

    async getLastDevice(){
        const device = await this.lastDevice;
        const name = (await (await device.locator('.device-name')).first()?.textContent())?.trim();
        const id =  (await (await device.locator('a.device-edit')).first().getAttribute('href'))?.split('/').slice(-1);
        return {id: id, name: name};
    }

    async getDevice(name) {
        const deviceList = await this.getDeviceList();
        for (const device of deviceList) {
            const actualName = (await (await device.locator('.device-name')).first()?.textContent())?.trim();
            if (actualName == name) {
                const result = {
                    name: actualName,
                    type: (await (await device.locator('.device-type')).first().textContent())?.trim(),
                    capacity: (await (await device.locator('.device-capacity')).first().textContent())?.trim().split(" ")[0],
                    edit: (await (await device.locator('.device-edit')).first().textContent())?.trim().toLowerCase(),
                    remove: (await (await device.locator('.device-remove')).first().textContent())?.trim().toLowerCase()
                }
                return result;
            }
        }
        return undefined;
    }

    async waitUntilDefined(name){
        const timeout = 60 * 1000;
        const start = new Date().valueOf();
        while (await this.getDevice(name) == undefined){
            const now = new Date().valueOf();
            const timeSpent = now - start;
            if (timeSpent >= timeout ){
                return undefined;
            }
        }
        return await this.getDevice(name);
    }

    async validateDevice(name, capacity, type) {
        const actualDevice = await this.waitUntilDefined(name);
        expect(actualDevice).toBeDefined();
        expect(actualDevice.capacity).toBe(capacity);
        expect(actualDevice.type).toBe(type);
        expect(actualDevice.edit).toBe("edit");
        expect(actualDevice.remove).toBe("remove");
    }

    async validateDeviceIsNotPresent(deletedId, name) {
        const deviceList = await this.getDeviceList();
        for (const device of deviceList) {
            const actualName = (await (await device.locator('.device-name')).first()?.textContent())?.trim();
            if (actualName == name) {
                const id =  (await (await device.locator('a.device-edit')).first().getAttribute('href'))?.split('/').slice(-1);
                const result = id == deletedId;
                expect(result).toBeFalsy();
            }
        }
        return true;
    }
}


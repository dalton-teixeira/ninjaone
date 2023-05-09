import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { expect } from '@playwright/test';

exports.DeviceApi = class DeviceApi {

    
    constructor() {
        dotenv.config();
        this.apiBaseiUrl = process.env.API_URL || "http://localhost:3000/";
    }

  
    async getDeviceList() {
        
        const response = await fetch(`${this.apiBaseiUrl}devices`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            expect(response.status).toBe(200);
            return response.json();
        }).catch(err => { expect(err).toBeNull() });

        let hasDevices = response != undefined && response != null

        expect(hasDevices).toBeTruthy();

        expect(response.length).toBeGreaterThan(0);

        return this.mapDeviceList(response);
    }

    async updateDevice(id, name, capacity, type){
        const body = {id: id, system_name: name, hdd_capacity: capacity, type: type};

        await fetch(`${this.apiBaseiUrl}devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            expect(response.status).toBe(200);
            return response.json();
        }).catch(err => { expect(err).toBeNull() });

    }

    async addDevice(name, capacity, type){
        const body = {system_name: name, hdd_capacity: capacity, type: type};

        const response = await fetch(`${this.apiBaseiUrl}devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(response => {
            expect(response.status).toBe(200);
            return response.json();
        }).catch(err => { expect(err).toBeNull() });
        return this.mapDevice(response);
    }

    async removeDevice(id){
        await fetch(`${this.apiBaseiUrl}devices/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            expect(response.status).toBe(200);
            return response.json();
        }).catch(err => { expect(err).toBeNull() });
       
    }

    mapDevice(device){
        return {id: device.id, name: device.system_name, type: device.type, capacity: device.hdd_capacity}
    }

    mapDeviceList(response){
        var deviceList = [];
        for (const device of response){
            deviceList.push(this.mapDevice(device));
        }
        return deviceList;
    }


}
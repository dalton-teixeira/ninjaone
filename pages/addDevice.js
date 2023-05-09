import dotenv from 'dotenv';

exports.AddDevicePage = class AddDevicePage {

    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        dotenv.config();
        this.baseUrl = process.env.SITE_URL || "http://localhost:3001/";
        this.page = page;
        this.systemName = page.getByLabel('System Name');
        this.typeDropdown = page.locator('#type');
        this.capacity = page.locator('#hdd_capacity');
        this.saveButton = page.getByText('SAVE');
    }

    async goto() {
        await this.page.goto(`${this.baseUrl}devices/add`);
    }

    async addDevice(name, capacity, type){
        await this.systemName.fill(name, {timeout: 60000});
        await this.capacity.fill(capacity);
        await this.typeDropdown.selectOption(type);
        await this.saveButton.click();
        this.page.getByText("ADD DEVICE");
    }

}
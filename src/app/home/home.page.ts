import { Component, Injector } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    public encodedSrc: SafeResourceUrl | String = '';
    public showVideoPreview = false;
    private readonly platform = this.injector.get(Platform);

    constructor(private injector: Injector) {
        this.platform
            .ready()
            .then(() => {

            })
            .catch((error) => {
                throw error;
            });
    }
}

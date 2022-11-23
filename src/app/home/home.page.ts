import { Component, Injector, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SmsRetrieverAz } from 'awesome-cordova-plugins-sms-retriever-az/ngx';
import { NgOtpInputComponent } from 'ng-otp-input';

// https://github.com/andreszs/cordova-plugin-demos/blob/main/com.andreszs.smsretriever.demo/www/js/index.js
declare const window: any;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    @ViewChild(NgOtpInputComponent) ngOtpInput: NgOtpInputComponent;

    hashString = '';

    private readonly platform = this.injector.get(Platform);
    private readonly smsRetrieverAz = this.injector.get(SmsRetrieverAz);

    public readonly isAndroid = this.platform.is('android');

    constructor(private injector: Injector) {
        this.platform
            .ready()
            .then(() => {
                if (this.isAndroid) {
                    document.addEventListener('onSMSArrive',  (_event) => {
                        console.log('onSMSArrive', _event);
                        // @ts-ignore
                        const [ otp ] = _event.message.match(/[\dA-Za-z]*\d+[\dA-Za-z]*/) || []
                        if(otp){
                            this.ngOtpInput.setValue(otp);
                        }
                    });
                }
            })
            .catch((error) => {
                throw error;
            });
    }

    onOtpChange(event: string){
        console.log('onOtpChange', event);
    }

    async appGetHashString(){
        const successCallback = function (strSuccess) {
            console.log(strSuccess);
        };
        const errorCallback = function (strError) {
            console.error(strError);
        };
        window.cordova.plugins.SMSRetriever.getHashString(successCallback, errorCallback);
        this.hashString = await this.smsRetrieverAz.getHashString();
    }

    appStartWatch(){
        const onSuccess = function (strSuccess) {
            console.log(strSuccess);
        };
        const onFail = function (strError) {
            console.error(strError);
        };
        window.cordova.plugins.SMSRetriever.startWatch(onSuccess, onFail);
    }

}

import { Component, Injector, ViewChild, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SmsRetrieverAz, SmsRetrieverStatus } from 'awesome-cordova-plugins-sms-retriever-az/ngx';
import { NgOtpInputComponent } from 'ng-otp-input';
import { Subscription } from 'rxjs';

// https://github.com/andreszs/cordova-plugin-demos/blob/main/com.andreszs.smsretriever.demo/www/js/index.js

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    @ViewChild(NgOtpInputComponent) ngOtpInput: NgOtpInputComponent;
    @ViewChild('oneTimeCode') oneTimeCode: ElementRef;

    public hashString = '';
    public isRetrieverStarted = false;

    private readonly platform = this.injector.get(Platform);
    private readonly smsRetrieverAz = this.injector.get(SmsRetrieverAz);
    private readonly subscriptions$ = new Subscription();

    public readonly isAndroid = this.platform.is('android');

    constructor(private injector: Injector) {
        this.platform
            .ready()
            .then(() => {
                if (this.isAndroid) {
                    this.smsRetrieverAz.onSMSArrive().subscribe(value => {
                        this.isRetrieverStarted = false;
                        const [otp] = value.message.match(/[\dA-Za-z]*\d+[\dA-Za-z]*/) || [];
                        if (otp) {
                            this.ngOtpInput.setValue(otp);
                            this.oneTimeCode.nativeElement.value = otp;
                        }

                        const [, , password] = value.message.match(/(password is )(\b\w+)/) || [];
                        if (password) {
                            this.ngOtpInput.setValue(password);
                            this.oneTimeCode.nativeElement.value = password;
                        }

                    })
                }
            })
            .catch((error) => {
                throw error;
            });
    }

    onOtpChange(event: string) {
        console.log('onOtpChange', event);
    }

    async appGetHashString() {
        this.hashString = await this.smsRetrieverAz.getHashString();
    }

    appStartWatch() {
        if (this.isRetrieverStarted) {
            return;
        }
        this.isRetrieverStarted = true;
        const subs = this.smsRetrieverAz.startWatch().subscribe({
            next: (status) => {
                console.log(status)
                this.isRetrieverStarted = status !== SmsRetrieverStatus.Done;
            },
            error: (error) => {
                console.error(error)
                this.isRetrieverStarted = false;
            },
            complete: () => console.info('complete')
        })
        this.subscriptions$.add(subs);
    }

}

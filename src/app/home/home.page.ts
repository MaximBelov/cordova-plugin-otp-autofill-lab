import { Component, Injector, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Platform, ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { SmsRetrieverAz, SmsRetrieverStatus } from 'awesome-cordova-plugins-sms-retriever-az/ngx';
import { NgOtpInputComponent } from 'ng-otp-input';
import { Subscription, BehaviorSubject } from 'rxjs';

// https://github.com/andreszs/cordova-plugin-demos/blob/main/com.andreszs.smsretriever.demo/www/js/index.js

declare const cordova: any;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewDidEnter {

    @ViewChild(NgOtpInputComponent) ngOtpInput: NgOtpInputComponent;
    @ViewChild('oneTimeCode') oneTimeCode: ElementRef;

    public hashString = '';
    public phoneNumber = '';
    public isRetrieverStarted = new BehaviorSubject(false);

    private readonly changeDetectorRef = this.injector.get(ChangeDetectorRef);
    private readonly platform = this.injector.get(Platform);
    private readonly smsRetrieverAz = this.injector.get(SmsRetrieverAz);
    private subscription$: Subscription;

    public readonly isAndroid = this.platform.is('android');

    constructor(private injector: Injector) {
        this.platform
            .ready()
            .then(() => {
                if (this.isAndroid) {
                    this.smsRetrieverAz.onSMSArrive().subscribe(value => {
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

    ionViewWillEnter() {
    }

    ionViewDidEnter() {
        this.appStartWatch();
    }

    onOtpChange(event: string) {
        console.log('onOtpChange', event);
    }

    async appGetHashString() {
        this.hashString = await this.smsRetrieverAz.getHashString();
    }

    appStartWatch() {
        if (this.isRetrieverStarted.value) {
            return;
        }
        this.isRetrieverStarted.next(true);
        this.changeDetectorRef.detectChanges();
        this.subscription$ = this.smsRetrieverAz.startWatch().subscribe({
            next: (status) => {
                console.log(status);
                this.isRetrieverStarted.next( status !== SmsRetrieverStatus.Done);
                this.changeDetectorRef.detectChanges();
                if (status === SmsRetrieverStatus.Done || status === SmsRetrieverStatus.AlreadyStarted) {
                    this.subscription$.unsubscribe();
                }
            },
            error: (error) => {
                console.error(error)
                this.isRetrieverStarted.next(false);
                this.changeDetectorRef.detectChanges();
                this.subscription$.unsubscribe();
            },
            complete: () => console.info('complete')
        })
    }

    async appStopWatch(){
        const result = await this.smsRetrieverAz.stopWatch();
        console.log('appStopWatch', result);
    }

    async appGetPhoneNumber(){
        this.phoneNumber = await this.smsRetrieverAz.getPhoneNumber();
        this.changeDetectorRef.detectChanges();
        console.log(this.phoneNumber);
    }

}

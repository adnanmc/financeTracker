import { Injectable } from '@angular/core';
import { SystemService } from '../system.service';
import { SmsService } from '../smsfunctions/sms.service';
import { HttpClient } from '@angular/common/http';
// declare const window: any;
declare const cordova: any;
declare const SMS: any;
// declare const device:any;
@Injectable()
export class CordovaService {
  systemService;
  smsList = [];
  ep;
  constructor(public smsService: SmsService,
    public http: HttpClient) {
    this.systemService = new SystemService();
    this.ep = this.systemService.getURL() + '/transaction';
    document.addEventListener('onSMSArrive', (e) => {

      var sms = e['data'];
      this.smsList.push(sms);
      let transactionObject = this.smsService.Transaction(sms);
      if (typeof transactionObject == 'object') {
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
        cordova.plugins.locationServices.geolocation.getCurrentPosition((position) => {
          this.http.put(this.ep + '/addMany', Object.assign(transactionObject, { geoLocation: position.coords })).subscribe(res => {
            console.log('sms sent');
          });
        }, this.onError, { enableHighAccuracy: true });
      }
    });
  }

  onError(error) {
    alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }
  runBackground() {
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.disableWebViewOptimizations();
    cordova.plugins.backgroundMode.on('activate', function () {
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });
    cordova.plugins.backgroundMode.on('enable', function () {
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });
  }
  readMessages() {
    const filter = {
      box: 'inbox',
    };
    SMS.listSMS(filter, async (data) => {
      let templist = [];
      this.smsList = data;
      await this.smsList.forEach(el => {
        let condi = this.smsService.Transaction(el)
        if (condi)
          templist.push(condi);
      });
      this.http.put(this.ep + '/addMany', templist).subscribe(res => {
        //popup
        console.log('sms list sent');
      },
      (err) => {
        alert('error list sms: ' + err);
      });
    }, (err) => {
      console.log('error list sms: ' + err);
    });
  }
  requestPermision(callback) {
    const permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.RECEIVE_SMS
      , (status) => {
        permissions.requestPermission(permissions.ACCESS_FINE_LOCATION
          , (status) => {
            permissions.requestPermission(permissions.READ_SMS, (status) => {
              callback(status);
            }, null);
          }, null);
      }, null);
  }
  test() {
    this.requestPermision((st) => {
      SMS.startWatch((status) => {
      }, null);
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });
  }
}
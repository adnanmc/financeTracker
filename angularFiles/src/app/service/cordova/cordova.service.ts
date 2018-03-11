import { Injectable } from '@angular/core';
import { SystemService } from '../system.service';

// declare const window: any;
declare const cordova: any;
declare const SMS: any;
// declare const device:any;
@Injectable()
export class CordovaService {
  systemService;
  smsList = [];
  constructor() {
    this.systemService = new SystemService();
    console.log(this.smsList);
    document.addEventListener('onSMSArrive', (e) => {
      var sms = e['data'];

      this.smsList.push(sms);
      console.log(this.smsList);
      navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
    });
  }
  onSuccess(position) {
    alert('Latitude: ' + position.coords.latitude + '\n' +
      'Longitude: ' + position.coords.longitude + '\n' +
      'Altitude: ' + position.coords.altitude + '\n' +
      'Accuracy: ' + position.coords.accuracy + '\n' +
      'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
      'Heading: ' + position.coords.heading + '\n' +
      'Speed: ' + position.coords.speed + '\n' +
      'Timestamp: ' + position.timestamp + '\n');
  }
  onError(error) {
    alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }
  runBackground() {
    cordova.plugins.backgroundMode.enable();
  }
  readMessages() {
    const filter = {
      box: 'inbox',
    };
    SMS.listSMS(filter, (data) => {
      // console.log(data);
      this.smsList= data;
    }, (err) => {
      console.log('error list sms: ' + err);
    });
  }
  requestPermision(callback) {
    // READ_SMS
    // RECEIVE_SMS
    const permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.RECEIVE_SMS
      , (status) => {
        console.log('inside first permission call' + status);
      }, null);
    permissions.requestPermission(permissions.ACCESS_FINE_LOCATION
        , (status) => {
          console.log('inside first permission call' + status);
        }, null);
    permissions.requestPermission(permissions.READ_SMS, (status) => {
      SMS.startWatch((status) => {
        console.log(status);
      }, null);
      callback(status);
    }, null);
  }
  
}
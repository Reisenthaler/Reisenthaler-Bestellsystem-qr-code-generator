import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import QRCode from 'qrcode';

import { HttpService } from "../http.service";

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  qrDataArray: { name: string, url: string }[] = [];
  qrCodes: { name: string, qrCode: string }[] = [];
  @ViewChild('qrCodeContainer', { static: true }) qrCodeContainer!: ElementRef<HTMLDivElement>;


  constructor(private http: HttpService) { }

  ngOnInit() {
    this.http.getTische().subscribe((data: any) => {
      data.forEach((item: any) =>{

        this.qrDataArray.push({ url: "http://localhost:4200/?tisch=" + item, name: item });
      });
      this.generateQRCodes();
    });
  }

  generateQRCodes() {
    this.qrDataArray.forEach(item => {
      QRCode.toDataURL(item.url, (err, qrCode) => {
        if (err) {
          console.error(err);
          return;
        }
        this.qrCodes.push({ name: item.name, qrCode: qrCode });
      });
    });
  }
}

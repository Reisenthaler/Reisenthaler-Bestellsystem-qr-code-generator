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

        let encodedItem = encodeURIComponent(item);
        let url = `http://192.168.1.2:4200/?tischname=${encodedItem}`;

        this.qrDataArray.push({ url:url , name: item });

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


  downloadWordDocument() {
    let imagesHtml = '';
    this.qrCodes.forEach((qrCodeData, index) => {
      imagesHtml += `<p>${qrCodeData.name}:</p><img src="${qrCodeData.qrCode}" alt="QR Code ${index + 1}" /><br/>`;
    });

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title></title></head>
      <body>
      <h1></h1>
      <p></p>
      ${imagesHtml}
      </body>
      </html>`;

    const blob = new Blob(['\ufeff', wordContent], {
      type: 'application/msword'
    });

    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = 'Reisenthaler-Bestellsystem-QrCodes.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { interval, Observable, Subject, Subscription } from "rxjs";
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = 'http://localhost:8080';
  private triggerUpdate: Subject<void> = new Subject<void>();
  private destroy$: Subject<void> = new Subject<void>();
  private intervalSubscription: Subscription | undefined;

  constructor(private http: HttpClient, private zone: NgZone) { }

  getAllButtons(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test`);
  }

  sentUpToDate(){
    this.http.post(`${this.baseUrl}/set_up_to_date`, "true").subscribe();
  }

  startGettingUpdates() {
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = interval(1000).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.zone.run(() => {
          this.http.get<any>(`${this.baseUrl}/get_update`).subscribe((update: any) => {
            //console.log(update);

            if (update[0] === "true")
            {
              this.triggerUpdate.next();
            }
          });
        });
      });
    });
  }

  stopGettingUpdates() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  get triggerUpdate$(): Observable<void> {
    return this.triggerUpdate.asObservable();
  }

  sendData(einkaufswagen: any[], tischname: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let copyOfFirstItem = Object.assign({}, einkaufswagen[0]);

    einkaufswagen.push(copyOfFirstItem);

    einkaufswagen[einkaufswagen.length - 1].name = tischname;
    console.log("sent data");
    console.log(einkaufswagen);
    return this.http.post<any>(`${this.baseUrl}/sendCheckoutData`,einkaufswagen, { headers });
  }

  getTische()
  {
    return this.http.get<any>(`${this.baseUrl}/get_tische`);
  }
}

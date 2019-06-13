import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class StocksService {

  constructor(private http: HttpClient) { }

  searchStock(params): Promise<any> {
    let url = [environment.api, 'stock_history'].join("/");
    url += '?currency=' + params.currency + '&date=' + params.date;

    if(params.symbol != null){
      url +=  '&symbol=' + params.symbol
    }

    const headers = {
      headers: new HttpHeaders()
        .append('content-type', 'application/json')
        .append('x-token', environment.tokenWTD)
        .append('x-token-curr', environment.tokenFixer)
    };

    return this.http.get<any>(url, headers).toPromise();
  }

  getCurrency(): Promise<any> {
    let url = [environment.api, 'currency'].join("/");

    const headers = {
      headers: new HttpHeaders()
        .append('content-type', 'application/json')
        .append('x-token', environment.tokenWTD)
        .append('x-token-curr', environment.tokenFixer)
    };

    return this.http.get<any>(url, headers).toPromise();
  }

  getStock(params): Promise<any> {
    let url = [environment.api, 'stock', 'latest'].join("/");

    if(params.symbol != null){
      url +=  '?symbol=' + params.symbol
    }

    const headers = {
      headers: new HttpHeaders()
        .append('content-type', 'application/json')
        .append('x-token', environment.tokenWTD)
        .append('x-token-curr', environment.tokenFixer)
    };

    return this.http.get<any>(url, headers).toPromise();
  }
}

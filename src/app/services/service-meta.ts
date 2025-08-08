import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceMeta {
  constructor(private http: HttpClient) {}

  getJSON(path: any): Observable<any> {
    return this.http.get(path);
  }

  httpGet(url: any, header?: any, params?: any) {
    const options: any = {};
    if (header) {
      const httpHeads = new HttpHeaders(header);
      options.headers = httpHeads;
    }

    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(function (key) {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
      options.showLoader = true;
    }
    return this.http.get(url, options);
  }
  // httpGetText(url: any, header?: any, params?: any) {
  //   const options: any = {};
  //   const httpHeads = new HttpHeaders({
  //     Accept: 'text/html, application/xhtml+xml, */*',
  //     '': 'application/x-www-form-urlencoded',
  //   });
  //   options.headers = httpHeads;
  //   options.responseType = 'Text';
  //   if (params) {
  //     let httpParams = new HttpParams();
  //     Object.keys(params).forEach(function (key) {
  //       httpParams = httpParams.append(key, params[key]);
  //     });
  //     options.params = httpParams;
  //     options.showLoader = true;
  //   }
  //   return this.http.get(url, options);
  // }
  httpGetText(url: string, header?: any, params?: any) {
    const options: any = {};
    const httpHeads = new HttpHeaders({
      Accept: 'text/html, application/xhtml+xml, */*',
      '': 'application/x-www-form-urlencoded',
    });
    options.headers = httpHeads;
    options.responseType = 'Text';
    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
      options.showLoader = true;
    }
    console.log('Request Options:', options);
    console.log('Request URL:', url);
    return this.http.get(url, options);
  }


  httpPost(url: any, body?: any, header?: any, params?: any) {
    const options: any = {};
    if (header) {
      const httpHeads = new HttpHeaders(header);
      options.headers = httpHeads;
    }
    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(function (key) {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
    }
    return this.http.post(url, body, options);
  }

  httpPatch(url: any, body?: any, header?: any, params?: any) {
    const options: any = {};
    if (header) {
      const httpHeads = new HttpHeaders(header);
      options.headers = httpHeads;
    }
    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(function (key) {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
    }
    return this.http.patch(url, body, options);
  }

  httpPut(url: any, body?: any, header?: any, params?: any) {
    const options: any = {};
    if (header) {
      const httpHeads = new HttpHeaders(header);
      options.headers = httpHeads;
    }
    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(function (key) {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
    }
    return this.http.put(url, body, options);
  }

  httpDelete(url: any, body?: any, header?: any, params?: any) {
    const options: any = {};
    if (header) {
      const httpHeads = new HttpHeaders(header);
      options.headers = httpHeads;
    }
    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(function (key) {
        httpParams = httpParams.append(key, params[key]);
      });
      options.params = httpParams;
    }
    if (body) {
      options.body = body;
    }
    return this.http.delete(url, options);
  }
}

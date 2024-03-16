import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {

  constructor(private http:HttpClient) { }

  findmethekeywords(keyword:string):Observable<any>{
    return this.http.get('https://appuv2.wl.r.appspot.com/keywords/'+keyword).pipe(map((res:any)=>{return res.terms;}));
  }
}

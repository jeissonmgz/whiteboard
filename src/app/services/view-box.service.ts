import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewBoxService {

  private subject = new Subject<any>();

  readonly ZOOM_IN = true;
  readonly ZOOM_OUT = false;

  readonly HORIZONTAL = true;
  readonly VERTICAL = false;
  readonly LEFT_OR_UP = true;
  readonly RIGHT_OR_DOWN = false;

  constructor() { }

  change(zoom, scroll:{orientation, direction, value}) {
    this.subject.next({ zoom: zoom, scroll:scroll });
  }

  getChanges(): Observable<any> {
      return this.subject.asObservable();
  }
  
}

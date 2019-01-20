import { Injectable } from '@angular/core';
import {Hero} from './hero';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { catchError, map, tap} from 'rxjs/operators' 
//import {HEROES} from './mock-heroes';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';


const httpOptions={
  headers: new HttpHeaders({'Content-Type' : 'application/json'})
};


@Injectable({
  providedIn: 'root'
})
export class HeroService {




  private heroesUrl= 'api/heroes';  //URL to web api



  constructor(
      private http : HttpClient, 
      private messageService: MessageService
    ) { }




  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  handleError<T>(operation= 'operation', result?: T){
    return(error: any): Observable<T> => {
      
      //TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
 
      //TODO; better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
    
      //Let the app keep running by returning an empty result
      return of(result as T)
    }
  }


  /** GET hero by id will 404 if id not found */
  getHero(id: number): Observable<Hero> {
   const url= `${this.heroesUrl}/${id}`;
   return this.http.get<Hero>(url).pipe(
       tap(_=>this.log(`fetched hero id=${id}`),
       catchError(this.handleError<Hero>(`getHero id=${id}`))
     )
   ) 
  }


  /** GET hero by id. return `undefined` when id not found */
  getheroNo404<Data>(id: number): Observable<Hero>{
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero>(url).pipe(
      map(heroes => heroes[0]), // returns a {0|1} element array
      tap(h => { const outcome= h? `fetched`: `did not find`;
        this.log(`${outcome} hero id=${id}`);
      }),
      catchError(this.handleError<Hero>(`getHero id=${id}`)) 
    )
  }

  
    /** Get heroes from the server */
    getHeroes(): Observable<Hero[]> {

      //TODO Send the message _after_ fetching the heroes
     //  this.messageService.add('HeroService: fetched heroes');
       
      return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes',[]))
      );
   }
 
   
   updateHero(hero: Hero): Observable<any> {
      return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
        tap(_=> this.log(`update hero id=${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  addHero(hero: Hero): Observable<Hero> {
       return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
         tap((hero: Hero) => this.log(`added hero w/ id=${hero.id}`)),
         catchError(this.handleError<Hero>('addHero'))    
       )
  }

  
  deleteHero(hero: Hero | number): Observable<Hero> {
    
        const id = typeof hero === 'number'? hero : hero.id;
        const url = `${this.heroesUrl}/${id}`;

        return this.http.delete<Hero>(url, httpOptions).pipe(
          tap(_ => this.log(`deleted hero id=${id}`)),
          catchError(this.handleError<Hero>('deleteHero'))
        );
  }


  /**Get heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]>{
       if(!term.trim()){
          //if not search term, return an empty hero array
          return of([]);
       } 
       return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
        .pipe(
          tap(_ => this.log(`found heroes matching "${term}"`)),
          catchError(this.handleError<Hero[]>('searchHeroes',[]))
        );
       
  }





  

  /** log a HeroServce message  with the MessageService */
  private log(message: string){
    this.messageService.add(`HeroService ${message}`);
  }


}

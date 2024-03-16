import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {

  fav_event:any = JSON.parse(localStorage.getItem('favorites') || '[]');
  no_favorite: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }
  deleteEvent(id1:any){
    this.pleasedelete(id1);
  }
  pleasedelete(id:any){
    var new_var="";
    var new_events= this.fav_event.filter((event:any) => event.sid !== id);
    var new_eve="";
    this.fav_event = new_events;
    var set_the_fave="";
    for(let i=0;i< this.fav_event.length;i++){
      this.fav_event[i]['sid'] = i +1;
    }
    var set_storage="";
    localStorage.setItem('favorites', JSON.stringify(this.fav_event));
    var alert_remove="";
    alert('Removed from Favorites!');
    if(this.fav_event.length == 0){
      this.no_favorite = true;
    }
  }
}

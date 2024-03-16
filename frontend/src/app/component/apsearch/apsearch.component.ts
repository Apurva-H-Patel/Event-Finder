import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { debounceTime,map,Observable,switchMap } from 'rxjs';
@Component({
  selector: 'app-apsearch',
  templateUrl: './apsearch.component.html',
  styleUrls: ['./apsearch.component.css']
})
export class ApsearchComponent implements OnInit {

  KP = new FormControl();
  CP = new FormControl();
  location_selected = new FormControl();
  distance_selected = new FormControl("10");
  automatic_location = new FormControl();
  // declare a global variable to hold local url 
  auto_search: boolean;
  moredata: Observable<any>;
  event_data: any =[];
  table_no_records: boolean =false;
  table_display: boolean = false;
  Event_display: boolean = false;
  showMore1: boolean = true;
  showMore2: boolean = true;
  showMore3: boolean = true;
  detailed_event: any={};

  onsale: boolean = false;
  postponed: boolean = false;
  cancelled: boolean = false;
  offsale: boolean = false;
  rescheduled: boolean = false;
  disable_aero: boolean = true;

  detailed_spotify: any = [];
  venue_name: string = '';

  venue_details: any = {};
  venuenameflag: boolean = false;
  addressflag: boolean = false;
  phonenumberflag:boolean =false;
  openhourflag:boolean = false;
  generalruleflag:boolean = false;
  childruleflag:boolean =false;
  googlemapflag:boolean = false;

  isfavorite: boolean = false;
  favorites: any = {};
  mapOpt:any;
  markerOpt:any;
  linktotweet: string = '';
  linktofb: string = '';
  no_result_artist: boolean = false;

  //added below
  has_artist: boolean=false;
  has_price: boolean=false;
  has_date: boolean=false;
  has_genre: boolean=false;
  has_ticket_status: boolean=false;
  has_buy_ticket_at: boolean=false;
  has_venue: boolean=false;
  google_platform:string ="https://appuv2.wl.r.appspot.com/";

  constructor(private ref: ChangeDetectorRef) { 
    this.auto_search = false;
    this.automatic_location.setValue(false);
    this.distance_selected.setValue("10");
    this.moredata= new Observable<any>();
    this.moredata= this.KP.valueChanges.pipe(
      debounceTime(200),
      switchMap(value => {
        return value? this.findings(value):[];
      })
    );
   }

  ngOnInit(): void {
    console.log("init");
    this.distance_selected.setValue("10");
  }
  async findings(value:string): Promise<any>{
    if(value.length < 1){
      return [];
    }
    else{
      this.auto_search = true;
      let url = "https://appuv2.wl.r.appspot.com/autocomplete/"+this.KP.value;
      console.log(url);
      var res = fetch(url);
      var data= await (await res).json();
      this.auto_search = false;
      return data.terms;
    }
  }
  toggleShowMore(): void {
    this.showMore1 = !this.showMore1;
  }
  toggleShowMore2(): void {
    this.showMore2 = !this.showMore2;
  }
  toggleShowMore3(): void {
    this.showMore3 = !this.showMore3;
  }
  clearformdata(){
    this.KP.setValue('');
    this.CP.setValue('');
    this.location_selected.setValue('');
    this.location_selected.enable();
    // this.distance_selected.setValue("10");
    // console.log(this.distance_selected.value);
    this.distance_selected.setValue("10");
    // console.log(this.distance_selected.value);
    this.automatic_location.setValue(false);
    this.event_data = [];
    this.table_display = false;
    this.table_no_records = false;
    this.auto_search = false;
    this.moredata= this.KP.valueChanges.pipe(
      debounceTime(200),
      switchMap(value => {
        return value? this.findings(value):[];
      })
    );
  }
  cleartheform(){
    this.venuenameflag = false;
    this.clearformdata();
    this.cleartheeventdetailes();
  }
  cleartheeventdetailes(){
    this.Event_display = false;
  }
  async submitted(){
    // console.log(this.KP.value);
    // console.log(this.CP.value);
    // console.log(this.location_selected.value);
    // console.log(this.distance_selected.value);
    // console.log("auto location below");
    // console.log(this.automatic_location.value);
    this.table_no_records = false;
    this.table_display = false;
    this.Event_display = false;
    //empty the detailed_spotify array
    this.detailed_spotify = [];
    this.event_data = [];
    this.detailed_event = {};
    this.venue_details = {};
    this.openhourflag = false;
    this.generalruleflag = false;
    this.childruleflag = false;
    this.phonenumberflag = false;
    this.addressflag = false;
    this.venuenameflag = false;
    this.googlemapflag = false;

    var latitute;
    var longitude;
    this.table_no_records = false;
    if(this.automatic_location.value == true){
      var res= await fetch('https://ipinfo.io/?token=3e5f7b2ce3f553');
      var data = await res.json();
      if(data.loc){
        var loc = data.loc.split(',');
        latitute = loc[0];
        longitude = loc[1];
        // console.log("i am here first");
        console.log(latitute);
        console.log(longitude);
      }
    }
    else{
        var res = await fetch('https://appuv2.wl.r.appspot.com/maps/'+this.location_selected.value);
        var data = await res.json();
        if(data.errors){
          this.table_no_records = true;
          return ;
        }
        latitute = data.lat;
        longitude = data.lng;
        // console.log("i am in google maps first");
      
    }
    // console.log("i am here second");
    var category='';
    if(this.CP.value == '' || this.CP.value== null){
      category = '';
    }
    else{
      category = this.CP.value;
    }
    let distance;

    if(this.distance_selected.value == '' || this.distance_selected.value == null){
      distance = 10;
    }
    else{
      distance = this.distance_selected.value;
    }
    var local='https://appuv2.wl.r.appspot.com/events?';
    var url =local +'term='+this.KP.value+'&category='+category+'&radius='+distance+'&latitute='+latitute+'&longitude='+longitude + '&limit=20';
    
    var res = await fetch(url);
    var data = await res.json();
    console.log(url);
    // console.log(data);
    if(data.err || data.eventsdata.length == 0){
      this.table_no_records = true;
      this.table_display = false;
      return;
    }
    else{
      this.event_data = data.eventsdata;
      // this.table_no_records = false;
      // this.table_display = true;
      // console.log(data);
      // console.log(this.event_data);
      // this.sortbydateandtime();
      // console.log(this.event_data);
      this.table_no_records = false;
      this.table_display = true;

    }
  }

  sortbydateandtime(){
    // code to sort the event_data by localdate and localtime property
    this.event_data.sort((a: any,b:any) => {
      var date1 = a.localdate + " " + a.localtime;
      var date2 = b.localdate + " " + b.localtime;
      return new Date(date1).getTime() - new Date(date2).getTime();
      // var date1 = new Date(a.localdate);
      // var date2 = new Date(b.localdate);
      // if(date1.getTime() == date2.getTime()){
      //   var time1 = new Date(a.localtime);
      //   var time2 = new Date(b.localtime);
      //   return time1.getTime() - time2.getTime();
      // }
      // else{
      //   return date1.getTime() - date2.getTime();
      // }
    }
    );
    // console.log("-----------------");
    // console.log(this.event_data);
  }


  checkbox_clicked(){
    if(this.automatic_location.value == false){
      // console.log(this.automatic_location.value);
      this.location_selected.disable();
      this.location_selected.setValue('');
    }
    else{
      // console.log(this.automatic_location.value);
      this.location_selected.enable();
      this.location_selected.setValue('');
    }
  }

  searchforevents(id :string){
    this.get_event_details(id);
  }
  async get_event_details(id : string){
    var url = 'https://appuv2.wl.r.appspot.com/eventdetails/'+id;
    var res = await fetch(url);
    var data = await res.json();
    console.log("new");
    console.log(data);
    this.venuenameflag = false;
    this.no_result_artist = true;
    if(data.errors){
      console.log(data.errors);
      return;
    }
    // console.log(id);
    // console.log("nkjakfmnlaksn");
    this.detailed_event = data.eventdata;

    //added below
    if(this.detailed_event.date == ''){
      this.has_date = false;
    }
    else{
      this.has_date = true;
    }

    if(this.detailed_event.artists == ''){
      this.has_artist = false;
    }
    else{
      this.has_artist = true;
    }

    if(this.detailed_event.venue == ''){
      this.has_venue = false;
    }
    else{
      this.has_venue = true;
    }

    if(this.detailed_event.genres == ''){
      this.has_genre = false;
    }
    else{
      this.has_genre = true;
    }

    if(this.detailed_event.priceRange == ''){
      this.has_price = false;
    }
    else{
      this.has_price = true;
    }

    if(this.detailed_event.buy_ticket_at == ''){
      this.has_buy_ticket_at = false;
    }
    else{
      this.has_buy_ticket_at = true;
    }

    if(this.detailed_event.ticket_status == ''){
      this.has_ticket_status = false;
    }
    else{
      this.has_ticket_status = true;
      if(this.detailed_event.ticket_status == 'onsale'){
        this.onsale = true;
        this.postponed = false;
        this.cancelled = false;
        this.offsale = false;
        this.rescheduled = false;
      }
      else if(this.detailed_event.ticket_status == 'postponed'){
        this.onsale = false;
        this.postponed = true;
        this.cancelled = false;
        this.offsale = false;
        this.rescheduled = false;
      }
      else if(this.detailed_event.ticket_status == 'cancelled' || this.detailed_event.ticket_status == 'canceled'){
        this.onsale = false;
        this.postponed = false;
        this.cancelled = true;
        this.offsale = false;
        this.rescheduled = false;
      }
      else if(this.detailed_event.ticket_status == 'offsale'){
        this.onsale = false;
        this.postponed = false;
        this.cancelled = false;
        this.offsale = true;
        this.rescheduled = false;
      }
      else if(this.detailed_event.ticket_status == 'rescheduled'){
        this.onsale = false;
        this.postponed = false;
        this.cancelled = false;
        this.offsale = false;
        this.rescheduled = true;
      }
    }
    

    this.venue_name = this.detailed_event.venue;
    // console.log("i am before temp");
    // var temp = this.get_venue_details(this.venue_name);
    console.log("--------Venue name---------");
    console.log(this.venue_name);
    console.log("debouncing");
    // debounceTime(5000);
    // var url = 'https://assignment8-380008.wl.r.appspot.com/eventvenue/'+this.venue_name;
    console.log("debouncing end");
    // console.log(url);
    console.log("below code started");
    console.log(data);
    console.log(data.eventdata.eventvenuess);
    var data =data.eventdata.eventvenuess;
    // var res = await fetch(url);
    // var data = await res.json();
    console.log("--------Venue details response---------"); 
    console.log(data);
    if(data.errors){
      this.addressflag = false;
      this.phonenumberflag = false;
      this.openhourflag = false;
      this.generalruleflag = false;
      this.childruleflag = false;
      this.venuenameflag = false;
      this.googlemapflag = false;
      console.log(data.errors);
      // return 0;
    }
    else{
      this.venue_details = data;

    if(this.venue_details.name == ""){
      this.addressflag = false;
      this.phonenumberflag = false;
      this.openhourflag = false;
      this.generalruleflag = false;
      this.childruleflag = false;
      this.venuenameflag = false;
      this.googlemapflag = false;
      // return 0;
    }
    else{
      this.venuenameflag = true;
      if(this.venue_details.event_coordinates.length == 0){
        this.googlemapflag = false;
      }
      else{
        this.markerOpt = {
          lat: parseFloat(this.venue_details.event_coordinates[0]),
          lng: parseFloat(this.venue_details.event_coordinates[1]),
        };
        this.googlemapflag = true;
      }

      if(this.venue_details.address !=""){
        this.addressflag = true;
      }
      else{
        this.addressflag = false;
      }
      if(this.venue_details.phonenumber !=""){
        this.phonenumberflag =true;
      }
      else{
        this.phonenumberflag = false;
      }
      if(this.venue_details.openhours !=""){
        this.openhourflag = true;
      }
      else{
        this.openhourflag = false;
      }
      if(this.venue_details.generalrule !=""){
        this.generalruleflag =true;
      }
      else{
        this.generalruleflag = false;
      }
      if(this.venue_details.childrule != ""){
        this.childruleflag = true;
      }
      else{
        this.childruleflag = false;
      }
    }

    console.log("end of venue details");
    }
    
    


    // console.log("i am after temp");
    this.new_spotify_call(this.detailed_event.music_related_artists);
    // console.log("i am after spotify");
    this.linktotweet = this.detailed_event.twitter_string;
    this.linktofb = this.detailed_event.main_url;
    // console.log(this.linktofb);
    this.isfavorite = this.getIffab(this.detailed_event.id);
    // this.mapOpt = {
    //   center: this.detailed_event.data_maps.center,
    //   zoom: 15
    // };
    // this.markerOpt = {
    //   lat: parseFloat(this.detailed_event.event_coordinates[0]),
    //   lng: parseFloat(this.detailed_event.event_coordinates[1]),
    // };
    // console.log(this.markerOpt);
    // if(this.detailed_event.ticket_status == 'onsale'){
    //   this.onsale = true;
    //   this.postponed = false;
    //   this.cancelled = false;
    //   this.offsale = false;
    //   this.rescheduled = false;
    // }
    // else if(this.detailed_event.ticket_status == 'postponed'){
    //   this.onsale = false;
    //   this.postponed = true;
    //   this.cancelled = false;
    //   this.offsale = false;
    //   this.rescheduled = false;
    // }
    // else if(this.detailed_event.ticket_status == 'cancelled' || this.detailed_event.ticket_status == 'canceled'){
    //   this.onsale = false;
    //   this.postponed = false;
    //   this.cancelled = true;
    //   this.offsale = false;
    //   this.rescheduled = false;
    // }
    // else if(this.detailed_event.ticket_status == 'offsale'){
    //   this.onsale = false;
    //   this.postponed = false;
    //   this.cancelled = false;
    //   this.offsale = true;
    //   this.rescheduled = false;
    // }
    // else if(this.detailed_event.ticket_status == 'rescheduled'){
    //   this.onsale = false;
    //   this.postponed = false;
    //   this.cancelled = false;
    //   this.offsale = false;
    //   this.rescheduled = true;
    // }

    // 1st comment
    // console.log(this.detailed_event.spotify);
    // this.spotify_details(this.detailed_event.spotify);
    // if(this.detailed_event.dnd){
    //   this.no_result_artist = true;
    // }
    // else{
    //   this.no_result_artist = false;
    // }
    // this.new_spotify_call(this.detailed_event.music_related_artists);
    // this.venue_name = this.detailed_event.venue;
    // this.get_venue_details(this.venue_name);
    this.table_display = false;
    this.Event_display = true;
  }
  async new_spotify_call(music:any){
    // console.log("i am in new spotify call");
    if(music.length == 0){
      this.no_result_artist = true;
      return;
    }
    else{
      this.no_result_artist = false;
    }
    if(music.length ==1){
      this.disable_aero = false;
    }else{
      this.disable_aero = true;
    }
    var results=[];
    // iterate through the music array and call the spotify api for each artist by its name and add their details in detailed_spotify 
    for(var i=0; i<music.length; i++){
      var url = 'https://appuv2.wl.r.appspot.com/spotify/'+music[i];
      var res = await fetch(url);
      var data = await res.json();
      // console.log("--------");
      if(data.length == 0){
        continue;
      }

      if(data[0]=="No Artist Found"){
        continue;
      }
      else{
        // console.log(data);
        results.push(data);
      }
      // if(data.errors){
      //   this.no_result_artist = true;
      //   return;
      // }
      // console.log(data);
      // results.push(data);
    }
    // console.log(results);
    this.detailed_spotify = results;
    if(this.detailed_spotify.length == 0){
      this.no_result_artist = true;
      // console.log("No result here");
    }
    else{
      this.no_result_artist = false;
    }
    console.log("End of spotify call");
  }
  getIffab(id:string){
    if(id.length == 0){
      return false;
    }
    var curfab= JSON.parse(localStorage.getItem('favorites') || '[]');
    for (var i =0; i<curfab.length; i++){
      if(curfab[i].id == id){
        return true;
      }
    }
    return false;
  }
  // async get_venue_details(venue_name : any){
  //     console.log("--------Venue name---------");
  //     console.log(venue_name);
  //     var url = 'https://assignment8-380008.wl.r.appspot.com/eventvenue/'+venue_name;
  //     console.log(url);
  //     var res = await fetch(url);
  //     var data = await res.json();
  //     console.log("--------Venue details response---------"); 
  //     console.log(data);
  //     if(data.errors){
  //       this.addressflag = false;
  //       this.phonenumberflag = false;
  //       this.openhourflag = false;
  //       this.generalruleflag = false;
  //       this.childruleflag = false;
  //       this.venuenameflag = false;
  //       this.googlemapflag = false;
  //       return 0;
  //     }
  //     this.venue_details = data.eventvenuess;

  //     if(this.venue_details.name == ""){
  //       this.addressflag = false;
  //       this.phonenumberflag = false;
  //       this.openhourflag = false;
  //       this.generalruleflag = false;
  //       this.childruleflag = false;
  //       this.venuenameflag = false;
  //       this.googlemapflag = false;
  //       return 0;
  //     }
  //     else{
  //       this.venuenameflag = true;
  //       if(this.venue_details.event_coordinates.length == 0){
  //         this.googlemapflag = false;
  //       }
  //       else{
  //         this.markerOpt = {
  //           lat: parseFloat(this.venue_details.event_coordinates[0]),
  //           lng: parseFloat(this.venue_details.event_coordinates[1]),
  //         };
  //         this.googlemapflag = true;
  //       }

  //       if(this.venue_details.address !=""){
  //         this.addressflag = true;
  //       }
  //       else{
  //         this.addressflag = false;
  //       }
  //       if(this.venue_details.phonenumber !=""){
  //         this.phonenumberflag =true;
  //       }
  //       else{
  //         this.phonenumberflag = false;
  //       }
  //       if(this.venue_details.openhours !=""){
  //         this.openhourflag = true;
  //       }
  //       else{
  //         this.openhourflag = false;
  //       }
  //       if(this.venue_details.generalrule !=""){
  //         this.generalruleflag =true;
  //       }
  //       else{
  //         this.generalruleflag = false;
  //       }
  //       if(this.venue_details.childrule != ""){
  //         this.childruleflag = true;
  //       }
  //       else{
  //         this.childruleflag = false;
  //       }
  //     }
      
  //     console.log("end of venue details");
  //     return 1;
  // }

  async spotify_details(details: any){
    this.detailed_spotify = details;
    // console.log(this.detailed_spotify.length);
    if(this.detailed_spotify.length == 1){
      this.disable_aero = false;
    }else{
      this.disable_aero = true;
    }
  }
  back(){
    this.detailed_event = {};
    this.Event_display = false;
    this.table_display = true;
  }

  onSubmitFavorite(){
    if(this.isfavorite == false)
    {
      this.favorites={
        id: this.detailed_event.id,
        date: this.detailed_event.date,
        name: this.detailed_event.name,
        category:this.detailed_event.genres,
        venue: this.detailed_event.venue,
        deleted:false
      }
      // console.log(this.favorites);
      var fav = JSON.parse(localStorage.getItem('favorites') || '[]');
      var total = fav.length;
      var fab={
        sid: total + 1,
        id: this.detailed_event.id,
        date: this.detailed_event.date,
        name: this.detailed_event.name,
        category:this.detailed_event.genres,
        venue: this.detailed_event.venue,
        deleted:false
      }
      fav.push(fab);
      localStorage.setItem('favorites', JSON.stringify(fav));
      // console.log(fav);
      alert("Event Added to Favorites!");
      this.isfavorite = true;
      this.ref.detectChanges();
    }
    else{
      var curr_fav = JSON.parse(localStorage.getItem('favorites') || '[]');
      for(var i=0;i<curr_fav.length;i++){
        if(curr_fav[i].id == this.detailed_event.id){
          curr_fav.splice(i,1);
        }
      }
      for(var i=0;i<curr_fav.length;i++){
        curr_fav[i].sid = i+1;
      }
      // console.log(curr_fav);
      alert('Event Removed from Favorites!');
      localStorage.setItem('favorites', JSON.stringify(curr_fav));
      this.isfavorite = false;
    }
  }
}

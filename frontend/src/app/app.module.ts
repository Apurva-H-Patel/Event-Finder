import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
// import { SearchformComponent } from './component/searchform/searchform.component';
import { FavoriteComponent } from './component/favorite/favorite.component';
import { BodyComponent } from './component/body/body.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApsearchComponent } from './component/apsearch/apsearch.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps'
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    // SearchformComponent,
    FavoriteComponent,
    BodyComponent,
    ApsearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatFormFieldModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyComponent } from './component/body/body.component';
import { FavoriteComponent } from './component/favorite/favorite.component';

const routes: Routes = [
  { path: 'favorites', component: FavoriteComponent},
  { path: 'search', component: BodyComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: '**', redirectTo: '/search', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

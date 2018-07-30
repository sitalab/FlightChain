import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FlightChainComponent} from "./flight-chain/flight-chain.component";


const routes: Routes = [
  {path: '', redirectTo: '/flight', pathMatch: 'full'},
  {path: 'flight', component: FlightChainComponent}
  // { path: 'detail/:id', component: HeroDetailComponent },
  // { path: 'heroes', component: HeroesComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

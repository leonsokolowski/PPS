import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashComponent } from './pages/splash/splash.component';
import { HomeComponent } from './pages/home/home.component';
import { CosasLindasComponent } from './pages/cosas-lindas/cosas-lindas.component';
import { CosasFeasComponent } from './pages/cosas-feas/cosas-feas.component';
import { GraficoLindasComponent } from './pages/grafico-lindas/grafico-lindas.component';
import { GraficoFeasComponent } from './pages/grafico-feas/grafico-feas.component';

export const routes: Routes = [
  {path: "", component:SplashComponent, title: "Bienvenido"},
  {path: "login", component: LoginComponent, title: "Login"},
  {path: "home", component: HomeComponent, title: "Home"},
  {path: "cosas-lindas", component: CosasLindasComponent, title: "Cosas Lindas"},
  {path: "cosas-feas", component: CosasFeasComponent, title: "Cosas Feas"},
  {path: "grafico-lindas", component: GraficoLindasComponent, title: "Grafico Lindas"},
  {path: "grafico-feas", component: GraficoFeasComponent, title: "Grafico Feas"}

];

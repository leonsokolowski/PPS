import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashComponent } from './pages/splash/splash.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {path: "", component:SplashComponent, title: "Bienvenido"},
  {path: "login", component: LoginComponent, title: "Login"},
  {path: "home", component: HomeComponent, title: "Home"},
];

import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    this.mostrarSplash();
  }

  async mostrarSplash()
  {
    await SplashScreen.show({
      autoHide: true,
      showDuration : 5000
    });
  }
}

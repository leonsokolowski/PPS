import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent  implements OnInit {
  billetes = Array(10);
  constructor(private router: Router) { }

  ngOnInit() : void {

    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 7000);

  }

}

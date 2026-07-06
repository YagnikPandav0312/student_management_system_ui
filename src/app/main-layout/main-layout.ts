import { Component, inject } from '@angular/core';
import { Footer } from "./footer/footer";
import { RouterOutlet } from "@angular/router";
import { Header } from "./header/header";
import { Sidebar } from "./sidebar/sidebar";
import { Common } from '../core/services/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Footer, RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  common = inject(Common);
}

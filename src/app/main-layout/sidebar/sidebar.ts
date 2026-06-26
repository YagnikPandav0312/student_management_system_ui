import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})

export class Sidebar {

   isStudentOpen = false;
  isTeacherOpen = false;
  isAcademicOpen = false;

  toggleMenu(menu: string) {

    if (menu === 'student') {
      this.isStudentOpen = !this.isStudentOpen;
    }

    if (menu === 'teacher') {
      this.isTeacherOpen = !this.isTeacherOpen;
    }

    if (menu === 'academic') {
      this.isAcademicOpen = !this.isAcademicOpen;
    }
  }
}

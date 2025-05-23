import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PasswordModalComponent implements AfterViewInit {
  @Input() isVisible = false;
  @Input() modalTitle = 'Desactivar Alarma'; // Nuevo: título personalizable
  @Input() modalMessage = 'Ingrese la contraseña para desactivar la alarma:'; // Nuevo: mensaje personalizable
  @Output() passwordSubmitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  password = '';
  showError = false;

  ngAfterViewInit() {
    if (this.isVisible) {
      setTimeout(() => {
        this.passwordInput?.nativeElement.focus();
      }, 100);
    }
  }

  onSubmit() {
    console.log('🔑 === PASSWORD MODAL SUBMIT ===');
    console.log('🔑 Password antes de trim:', `"${this.password}"`);
    console.log('🔑 Longitud antes de trim:', this.password.length);
    
    if (!this.password.trim()) {
      console.log('🔑 ❌ Password vacío después de trim');
      return;
    }
    
    const trimmedPassword = this.password.trim();
    console.log('🔑 Password después de trim:', `"${trimmedPassword}"`);
    console.log('🔑 Longitud después de trim:', trimmedPassword.length);
    console.log('🔑 Password en hexadecimal:', Array.from(trimmedPassword).map(c => c.charCodeAt(0).toString(16)).join(' '));
    
    console.log('🔑 Emitiendo passwordSubmitted...');
    this.passwordSubmitted.emit(trimmedPassword);
  }

  onCancel() {
    console.log('🔑 === PASSWORD MODAL CANCEL ===');
    console.log('🔑 Usuario canceló el modal');
    this.cancelled.emit();
  }

  showErrorMessage() {
    console.log('🔑 === SHOWING ERROR MESSAGE ===');
    this.showError = true;
    this.password = '';
    setTimeout(() => {
      this.showError = false;
      this.passwordInput?.nativeElement.focus();
    }, 3000);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('🔑 Enter presionado - enviando formulario');
      this.onSubmit();
    } else if (event.key === 'Escape') {
      console.log('🔑 Escape presionado - cancelando');
      this.onCancel();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      console.log('🔑 Click en backdrop - cancelando');
      this.onCancel();
    }
  }

  reset() {
    console.log('🔑 === RESET PASSWORD MODAL ===');
    this.password = '';
    this.showError = false;
  }
}
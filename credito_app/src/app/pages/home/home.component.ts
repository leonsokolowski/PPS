import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, AlertController } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QrScannerService } from '../../services/qr-scanner.service';
import { IonText } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  qrScanner = inject(QrScannerService);
  alertController = inject(AlertController);
  
  creditos: number = 0;
  mensaje: string = '';
  perfil: string = '';
  billetes = Array(10);
  cargandoCreditos = false;
  escaneando = false;
  mostrarDialogoLimpiar = false;

  constructor() { }

  async ngOnInit() {
    await this.generarPerfil();
    await this.cargarCreditos();
  }

  ngOnDestroy() {
    // Detener scanner si está activo al salir del componente
    this.qrScanner.detenerScanner();
  }

  logout() {
    this.auth.cerrarSesion();
  }

  // Generar perfil del usuario
  async generarPerfil() {
    const emailsAdmin = [
      'admin1@example.com',
      'admin2@example.com', 
      'admin3@example.com'
    ];

    const emailUsuario = this.auth.usuario_actual?.email || '';
    
    if (emailsAdmin.includes(emailUsuario)) {
      this.perfil = 'admin';
    } else {
      this.perfil = 'usuario';
    }
  }

  // Cargar créditos del usuario desde la BD
  async cargarCreditos() {
    this.cargandoCreditos = true;
    
    try {
      const resultado = await this.qrScanner.obtenerCreditosUsuario();
      
      if (resultado.success) {
        this.creditos = resultado.total || 0;
        this.mensaje = '';
      } else {
        this.mensaje = `Error al cargar créditos: ${resultado.error}`;
        console.error('Error cargando créditos:', resultado.error);
      }
    } catch (error) {
      this.mensaje = 'Error inesperado al cargar créditos';
      console.error('Error inesperado:', error);
    }
    
    this.cargandoCreditos = false;
  }

  // Escanear código QR
  async escanearQR() {
    if (this.escaneando) return;
    
    this.escaneando = true;
    this.mensaje = 'Preparando escáner...';

    try {
      const resultado = await this.qrScanner.escanearQR();
      
      if (resultado.success && resultado.data) {
        await this.procesarCodigoQR(resultado.data);
      } else {
        this.mensaje = resultado.error || 'Error al escanear código QR';
      }
    } catch (error) {
      this.mensaje = 'Error inesperado al escanear: ' + error;
    }
    
    this.escaneando = false;
  }

  // Procesar el código QR escaneado
  async procesarCodigoQR(codigo: string) {
    this.mensaje = 'Procesando código...';

    // Verificar si el código es válido
    if (!this.qrScanner.esCodigoValido(codigo)) {
      this.mensaje = 'Código QR no válido';
      return;
    }

    const valorCredito = this.qrScanner.determinarValorQR(codigo);
    
    // Verificar si el código ya fue cargado
    const verificacion = await this.qrScanner.verificarCodigoCargado(codigo);
    
    if (!verificacion.success) {
      this.mensaje = `Error al verificar código: ${verificacion.error}`;
      return;
    }

    const { cargado, vecesUsado } = verificacion;

    // Lógica de carga según perfil - CORREGIDO
    let puedeCargar = false;
    let mensajeError = '';

    if (!cargado) {
      // Código nunca usado - siempre se puede cargar
      puedeCargar = true;
    } else if (this.perfil === 'admin') {
      // Admin puede cargar hasta 2 veces (corregido de 3 a 2)
      if (vecesUsado! < 2) {
        puedeCargar = true;
      } else {
        mensajeError = 'Código ya usado el máximo de veces permitidas (2 veces)';
      }
    } else {
      // Usuario normal no puede cargar códigos ya usados
      mensajeError = 'Este código ya fue cargado anteriormente';
    }

    if (puedeCargar) {
      // Intentar insertar el crédito
      const insercion = await this.qrScanner.insertarCredito(codigo, valorCredito);
      
      if (insercion.success) {
        this.mensaje = `¡Crédito cargado! +${valorCredito} puntos`;
        await this.cargarCreditos(); // Actualizar el total
      } else {
        this.mensaje = `Error al cargar crédito: ${insercion.error}`;
      }
    } else {
      this.mensaje = mensajeError;
    }
  }

  // Mostrar diálogo personalizado para limpiar créditos
  mostrarDialogo() {
    this.mostrarDialogoLimpiar = true;
  }

  // Cerrar diálogo personalizado
  cerrarDialogo() {
    this.mostrarDialogoLimpiar = false;
  }

  // Limpiar créditos con confirmación personalizada
  async limpiarCreditos() {
    this.mostrarDialogo();
  }

  // Ejecutar la limpieza de créditos
  async ejecutarLimpiezaCreditos() {
    this.cerrarDialogo();
    this.mensaje = 'Limpiando créditos...';
    
    const resultado = await this.qrScanner.limpiarCreditosUsuario();
    
    if (resultado.success) {
      this.creditos = 0;
      this.mensaje = 'Créditos limpiados correctamente';
    } else {
      this.mensaje = `Error al limpiar créditos: ${resultado.error}`;
    }
  }
}
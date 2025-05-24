import { Injectable, inject } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface CreditoRecord {
  id?: number;
  usuario: string;
  valor_credito: number;
  codigo_qr: string;
  fecha_carga?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private sb = inject(SupabaseService);
  private auth = inject(AuthService);

  // Códigos QR válidos y sus valores
  private codigosValidos = {
    '8c95def646b6127282ed50454b73240300dccabc': 10,
    'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': 50,
    '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': 100
  };

  constructor() { }

  // Escanear código QR
  async escanearQR(): Promise<{ success: boolean, data?: string, error?: string }> {
    try {
      // Verificar y solicitar permisos
      const permission = await BarcodeScanner.checkPermission({ force: true });
      
      if (!permission.granted) {
        return { success: false, error: 'Permisos de cámara denegados. Por favor, habilite los permisos de cámara en la configuración de la aplicación.' };
      }

      // Preparar la interfaz para el scanner
      await this.prepararScanner();
      
      // Iniciar escaneo
      const result = await BarcodeScanner.startScan();
      
      // Limpiar interfaz
      await this.limpiarScanner();

      if (result.hasContent) {
        // Limpiar y normalizar el código escaneado
        const codigoLimpio = this.limpiarCodigo(result.content);
        console.log('Código escaneado original:', result.content);
        console.log('Código limpio:', codigoLimpio);
        return { success: true, data: codigoLimpio };
      } else {
        return { success: false, error: 'Escaneo cancelado o sin contenido' };
      }
    } catch (error) {
      await this.limpiarScanner();
      console.error('Error en escaneo:', error);
      return { success: false, error: 'Error al acceder a la cámara: ' + error };
    }
  }

  // Limpiar y normalizar el código escaneado
  private limpiarCodigo(codigo: string): string {
    if (!codigo) return '';
    
    // Remover espacios en blanco al inicio y final
    let codigoLimpio = codigo.trim();
    
    // Convertir a minúsculas para comparación consistente
    codigoLimpio = codigoLimpio.toLowerCase();
    
    // Si el código viene con prefijos como "qr:" o similar, removerlos
    const prefijos = ['qr:', 'code:', 'hash:', 'id:'];
    for (const prefijo of prefijos) {
      if (codigoLimpio.startsWith(prefijo)) {
        codigoLimpio = codigoLimpio.substring(prefijo.length);
        break;
      }
    }
    
    // Remover caracteres especiales que no deberían estar
    codigoLimpio = codigoLimpio.replace(/[^a-f0-9]/g, '');
    
    return codigoLimpio;
  }

  // Preparar la interfaz para el scanner
  private async prepararScanner(): Promise<void> {
    try {
      // Ocultar elementos de la app
      document.querySelector('body')?.classList.add('scanner-active');
      
      // Hacer transparente el fondo de la app
      const ionApp = document.querySelector('ion-app');
      if (ionApp) {
        (ionApp as HTMLElement).style.display = 'none';
      }
    } catch (error) {
      console.error('Error preparando scanner:', error);
    }
  }

  // Limpiar la interfaz después del scanner
  private async limpiarScanner(): Promise<void> {
    try {
      // Restaurar elementos de la app
      document.querySelector('body')?.classList.remove('scanner-active');
      
      const ionApp = document.querySelector('ion-app');
      if (ionApp) {
        (ionApp as HTMLElement).style.display = 'block';
      }
    } catch (error) {
      console.error('Error limpiando scanner:', error);
    }
  }

  // Determinar valor del código QR - mejorado
  determinarValorQR(codigo: string): number {
    const codigoLimpio = this.limpiarCodigo(codigo);
    console.log('Determinando valor para código:', codigoLimpio);
    
    const valor = this.codigosValidos[codigoLimpio as keyof typeof this.codigosValidos] || 0;
    console.log('Valor encontrado:', valor);
    
    return valor;
  }

  // Verificar si el código es válido - mejorado
  esCodigoValido(codigo: string): boolean {
    const codigoLimpio = this.limpiarCodigo(codigo);
    console.log('Verificando validez del código:', codigoLimpio);
    console.log('Códigos válidos disponibles:', Object.keys(this.codigosValidos));
    
    const esValido = codigoLimpio in this.codigosValidos;
    console.log('¿Es válido?', esValido);
    
    return esValido;
  }

  // Obtener todos los créditos del usuario actual
  async obtenerCreditosUsuario(): Promise<{ success: boolean, creditos?: CreditoRecord[], total?: number, error?: string }> {
    try {
      const usuario = this.auth.usuario_actual?.email;
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const { data, error } = await this.sb.supabase
        .from('creditos')
        .select('*')
        .eq('usuario', usuario);

      if (error) {
        return { success: false, error: error.message };
      }

      const total = data?.reduce((sum, credito) => sum + credito.valor_credito, 0) || 0;
      
      return { success: true, creditos: data || [], total };
    } catch (error) {
      return { success: false, error: 'Error al obtener créditos: ' + error };
    }
  }

  // Verificar si un código ya fue cargado por el usuario - mejorado
  async verificarCodigoCargado(codigoQR: string): Promise<{ success: boolean, cargado?: boolean, vecesUsado?: number, error?: string }> {
    try {
      const usuario = this.auth.usuario_actual?.email;
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const codigoLimpio = this.limpiarCodigo(codigoQR);

      const { data, error } = await this.sb.supabase
        .from('creditos')
        .select('*')
        .eq('usuario', usuario)
        .eq('codigo_qr', codigoLimpio);

      if (error) {
        return { success: false, error: error.message };
      }

      const vecesUsado = data?.length || 0;
      const cargado = vecesUsado > 0;
      
      return { success: true, cargado, vecesUsado };
    } catch (error) {
      return { success: false, error: 'Error al verificar código: ' + error };
    }
  }

  // Insertar nueva carga de crédito - mejorado
  async insertarCredito(codigoQR: string, valorCredito: number): Promise<{ success: boolean, error?: string }> {
    try {
      const usuario = this.auth.usuario_actual?.email;
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const codigoLimpio = this.limpiarCodigo(codigoQR);

      const nuevoCredito: CreditoRecord = {
        usuario,
        valor_credito: valorCredito,
        codigo_qr: codigoLimpio,
        fecha_carga: new Date().toISOString()
      };

      const { error } = await this.sb.supabase
        .from('creditos')
        .insert([nuevoCredito]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al insertar crédito: ' + error };
    }
  }

  // Limpiar todos los créditos del usuario
  async limpiarCreditosUsuario(): Promise<{ success: boolean, error?: string }> {
    try {
      const usuario = this.auth.usuario_actual?.email;
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const { error } = await this.sb.supabase
        .from('creditos')
        .delete()
        .eq('usuario', usuario);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al limpiar créditos: ' + error };
    }
  }

  // Detener el scanner si está activo
  async detenerScanner(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
      await this.limpiarScanner();
    } catch (error) {
      console.error('Error al detener scanner:', error);
    }
  }

  // Método de utilidad para debugging - puedes usarlo temporalmente
  obtenerCodigosValidos(): any {
    return this.codigosValidos;
  }
}
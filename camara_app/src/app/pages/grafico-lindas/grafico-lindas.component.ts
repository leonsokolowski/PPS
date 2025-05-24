import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';
import { FotosService } from '../../services/fotos.service';

// Registrar los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-grafico-lindas',
  templateUrl: './grafico-lindas.component.html',
  styleUrls: ['./grafico-lindas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  ]
})
export class GraficoLindasComponent implements OnInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private fotosService = inject(FotosService);
  private router = inject(Router);
  
  cargando = false;
  chart: Chart | null = null;
  datosEstadisticas: any = null;
  totalFotos = 0;
  totalVotos = 0;

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const fotos = await this.fotosService.obtenerFotosMasVotadas('linda', 10);
      
      if (fotos.length === 0) {
        this.datosEstadisticas = null;
        return;
      }

      // Calcular estadísticas
      this.totalFotos = fotos.length;
      this.totalVotos = fotos.reduce((sum, foto) => sum + foto.votos, 0);

      // Preparar datos para el gráfico de torta
      const labels = fotos.map((foto, index) => `Foto ${index + 1}`);
      const data = fotos.map(foto => foto.votos);
      const colors = this.generarColores(fotos.length);

      this.datosEstadisticas = {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 2
        }]
      };

      // Crear el gráfico después de que la vista se haya inicializado
      setTimeout(() => {
        this.crearGrafico();
      }, 100);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  private crearGrafico() {
    if (!this.chartCanvas || !this.datosEstadisticas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: this.datosEstadisticas,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Votos - Cosas Lindas',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#2dd36f'
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                // Filtramos y convertimos a números solo los valores válidos
                const dataArray = context.dataset.data as number[];
                const validNumbers = dataArray.filter(value => typeof value === 'number' && !isNaN(value));
                const total = validNumbers.reduce((a, b) => a + b, 0);
                
                const currentValue = context.parsed as number;
                const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : '0.0';
                
                return `${context.label}: ${currentValue} votos (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private generarColores(cantidad: number): string[] {
    const colores = [
      'rgba(45, 211, 111, 0.7)',  // Verde principal
      'rgba(32, 201, 151, 0.7)',  // Verde agua
      'rgba(16, 185, 129, 0.7)',  // Verde esmeralda
      'rgba(5, 150, 105, 0.7)',   // Verde oscuro
      'rgba(34, 197, 94, 0.7)',   // Verde lima
      'rgba(74, 222, 128, 0.7)',  // Verde claro
      'rgba(134, 239, 172, 0.7)', // Verde muy claro
      'rgba(187, 247, 208, 0.7)', // Verde pastel
      'rgba(220, 252, 231, 0.7)', // Verde muy pastel
      'rgba(240, 253, 244, 0.7)'  // Verde casi blanco
    ];
    
    return colores.slice(0, cantidad);
  }

  volver() {
    this.router.navigate(['/cosas-lindas']);
  }
}
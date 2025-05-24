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
  selector: 'app-grafico-feas',
  templateUrl: './grafico-feas.component.html',
  styleUrls: ['./grafico-feas.component.scss'],
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
export class GraficoFeasComponent implements OnInit {
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
      const fotos = await this.fotosService.obtenerFotosMasVotadas('fea', 10);
      
      if (fotos.length === 0) {
        this.datosEstadisticas = null;
        return;
      }

      // Calcular estadísticas
      this.totalFotos = fotos.length;
      this.totalVotos = fotos.reduce((sum, foto) => sum + foto.votos, 0);

      // Preparar datos para el gráfico de barras
      const labels = fotos.map((foto, index) => `Foto ${index + 1}`);
      const data = fotos.map(foto => foto.votos);

      this.datosEstadisticas = {
        labels,
        datasets: [{
          label: 'Votos recibidos',
          data,
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
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
      type: 'bar' as ChartType,
      data: this.datosEstadisticas,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Ranking de Votos - Cosas Feas',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#dc3545'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} votos`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#666'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  volver() {
    this.router.navigate(['/cosas-feas']);
  }
}
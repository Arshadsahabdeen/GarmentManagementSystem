import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { RouterModule } from '@angular/router';
import { ReportService, MaterialPriceSummary, StitchedByMaterial } from '../../services/report.service';
import { DispatchReportComponent } from '../dispatch-report/dispatch-report.component';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-general-report',
  templateUrl: './general-report.component.html',
  styleUrls: ['./general-report.component.css'],
  imports: [RouterModule, CommonModule, FormsModule],
  standalone: true,
})
export class GeneralReportComponent {
  selectedReportSection: string = 'dashboard';

  @ViewChild(DispatchReportComponent) dispatchReportComponent!: DispatchReportComponent;


  showGenerateModal = false;
  selectedComponent = 'dispatch';
  modalFromDate = '';
  modalToDate = '';
  modalSortOrder: 'asc' | 'desc' = 'asc';
  modalDispatchStatus: '' | 'true' | 'false' = '';


  priceProfitData: MaterialPriceSummary = {
    total_price_bought: 0,
    total_price_sold: 0,
    profit: 0,
  };
  stitchedByMaterialData: StitchedByMaterial[] = [];

  // Chart instances
  lineChart: Chart | undefined;
  donutChart: Chart | undefined;

  constructor(private router: Router, private reportService: ReportService) {}

  ngOnInit(): void {
    // Load dashboard data initially
    if (this.selectedReportSection === 'dashboard') {
      this.loadDashboardData();
    }
  }

  selectReport(section: string) {
    this.selectedReportSection = section;
    this.selectedComponent = section;

    if (section === 'dashboard') {
      // When dashboard is selected, reload dashboard data and re-render charts
      this.loadDashboardData();
    } else {
      this.router.navigate([`/reports/${section}`]);
    }
  }

  loadDashboardData() {
    this.reportService.getPriceAndProfitSummary().subscribe(data => {
      this.priceProfitData = data;
    });
    this.reportService.getPriceProfitOverTime().subscribe(data => {
      this.renderLineChartOverTime(data);
    });

    this.reportService.getQuantityStitchedByMaterial().subscribe(data => {
      this.stitchedByMaterialData = data;

      const stitchedData = data.map(d => ({
        materialDesc: d.materialDesc,
        quantityStitched: d.quantityStitched,
      }));

      setTimeout(() => {
        this.renderDonutChart(stitchedData, 'donutChartStitched', 'Stitching Quantity by Material');
      }, 0);
    });
  }

  renderBarChart() {
    const data = this.priceProfitData;

    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy previous chart instance to avoid duplicates
    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Summary'],
        datasets: [
          {
            label: 'Purchased Price',
            data: [data.total_price_bought],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
          {
            label: 'Dispatched Price',
            data: [data.total_price_sold],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'Profit',
            data: [data.profit],
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Price and Profit Summary' },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
  renderLineChartOverTime(data: {
  date: string;
  total_price_bought: number;
  total_price_sold: number;
  profit: number;
}[]) {
  const labels = data.map(entry => entry.date);
  const purchasedPrices = data.map(entry => entry.total_price_bought);
  const dispatchedPrices = data.map(entry => entry.total_price_sold);
  const profits = data.map(entry => entry.profit);

  const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
  if (!ctx) return;

  if (this.lineChart) this.lineChart.destroy();

  this.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Purchased Price',
          data: purchasedPrices,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Dispatched Price',
          data: dispatchedPrices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Profit',
          data: profits,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          fill: true,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Price & Profit Over Time (Monthly)',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount (₹)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Month (YYYY-MM)',
          },
        },
      },
    },
  });
}



  renderDonutChart(
    dataArray: { materialDesc: string; quantityStitched: number }[],
    canvasId: string,
    chartTitle: string
  ) {
    const filteredData = dataArray.filter(d => d.quantityStitched > 0);
    if (!filteredData.length) return;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance if exists
    if (this.donutChart) this.donutChart.destroy();

    const labels = filteredData.map(d => d.materialDesc);
    const quantities = filteredData.map(d => d.quantityStitched);

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: quantities,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: chartTitle },
        },
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

openGenerateReport() {
  this.showGenerateModal = true;
}

closeGenerateModal() {
  this.showGenerateModal = false;
}
confirmGenerateReport() {
  const filters = {
    fromDate: this.modalFromDate,
    toDate: this.modalToDate,
    sortOrder: this.modalSortOrder,
    status: this.modalDispatchStatus
  };

  this.closeGenerateModal();

  switch (this.selectedComponent) {
    case 'dispatch':
      // You can use a shared service or trigger an event if the component is standalone
      window.dispatchEvent(
        new CustomEvent('generate-dispatch-report', { detail: filters })
      );
      break;
    case 'material':
      // You can use a shared service or trigger an event if the component is standalone
      window.dispatchEvent(
        new CustomEvent('generate-material-report', { detail: filters })
      );
      break;
    case 'process':
      // You can use a shared service or trigger an event if the component is standalone
      window.dispatchEvent(
        new CustomEvent('generate-process-report', { detail: filters })
      );
      break;
    case 'stitching':
      // You can use a shared service or trigger an event if the component is standalone
      window.dispatchEvent(
        new CustomEvent('generate-stitching-report', { detail: filters })
      );
      break;
    case 'tailor':
      window.dispatchEvent(
        new CustomEvent('generate-tailor-report', { detail: filters })
      );
      break;
    // Add other components similarly...
  }
}

}

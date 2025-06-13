import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MaterialProcessService } from '../../services/material-process.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);
import 'chartjs-adapter-date-fns';


@Component({
  selector: 'app-process-report',
  templateUrl: './process-report.component.html',
  standalone: true,
  styleUrls: ['./process-report.component.css'],
  imports: [FormsModule , ReactiveFormsModule , CommonModule]
})
export class ProcessReportComponent implements OnInit {

  filteredProcessData: any[] = [];
  filterProcessFromDate: string = '';
  filterProcessToDate: string = '';
  materialProcessData: any[] = [];
  pagedProcessData: any[] = [];
  currentProcessPage = 1;
  processPageSize = 10;
  totalProcessPages = 1;
  processSortColumn: string = 'Process_Id';
  processSortDirection: 'asc' | 'desc' = 'asc';
  
  availableMaterials: string[] = [];
availableColors: string[] = [];

selectedMaterial: string = '';
selectedColor: string = '';


  @ViewChild('donutChartProcess') donutChartProcessRef!: ElementRef<HTMLCanvasElement>;
  donutChartProcess: Chart | undefined;

  @ViewChild('processLineChart') processLineChartRef!: ElementRef<HTMLCanvasElement>;
  processLineChart: Chart | undefined;

  constructor(private materialProcessService: MaterialProcessService) {}

  ngOnInit() {
    this.loadMaterialProcessData();
    window.addEventListener('generate-process-report', (event: any) => {
    const filters = event.detail;
    this.generateReport(filters.fromDate, filters.toDate, filters.sortOrder);
  });
  }

  loadMaterialProcessData() {
    this.materialProcessService.getAll().subscribe((data) => {
      this.materialProcessData = data;
      this.filteredProcessData = [...data];
      this.totalProcessPages = Math.ceil(this.filteredProcessData.length / this.processPageSize);
      this.currentProcessPage = 1;
      this.pagedProcessData = this.filteredProcessData.slice(0, this.processPageSize);
      this.extractFilterOptions();
      this.renderProcessDonutChart();
      this.renderProcessQuantityOverTimeLineChart();
    });
  }

  filterProcessByDate() {
    this.currentProcessPage = 1;

    const fromDate = this.filterProcessFromDate ? new Date(this.filterProcessFromDate) : new Date('1970-01-01');
    const toDate = this.filterProcessToDate ? new Date(this.filterProcessToDate) : new Date();

    this.filteredProcessData = this.materialProcessData.filter(p => {
      const processedDate = new Date(p.Processed_Date);
      return processedDate >= fromDate && processedDate <= toDate;
    });

    this.applyProcessSorting();
    this.updateProcessPagination();
  }

  extractFilterOptions() {
  const materialSet = new Set<string>();
  const colorSet = new Set<string>();

  this.materialProcessData.forEach(item => {
    if (item.Material_Desc) {
      materialSet.add(item.Material_Desc.toLowerCase());
    }
    if (item.Color) {
      colorSet.add(item.Color.toLowerCase());
    }
  });

  this.availableMaterials = Array.from(materialSet);
  this.availableColors = Array.from(colorSet);
}

applyFilters() {
  this.filteredProcessData = this.materialProcessData.filter(item => {
    const matchesMaterial = this.selectedMaterial
      ? item.Material_Desc.toLowerCase() === this.selectedMaterial.toLowerCase()
      : true;

    const matchesColor = this.selectedColor
      ? item.Color.toLowerCase() === this.selectedColor.toLowerCase()
      : true;

    return matchesMaterial && matchesColor;
  });

  this.currentProcessPage = 1;
  this.updateProcessPagination(); // your existing function
}
clearFilters() {
  this.selectedMaterial = '';
  this.selectedColor = '';
  this.applyFilters();
}


  sortProcessTable(column: string) {
    if (this.processSortColumn === column) {
      this.processSortDirection = this.processSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.processSortColumn = column;
      this.processSortDirection = 'asc';
    }
    this.applyProcessSorting();
    this.updateProcessPagination();
  }

  applyProcessSorting() {
    this.filteredProcessData.sort((a, b) => {
      let valA = a[this.processSortColumn];
      let valB = b[this.processSortColumn];

      // 🕒 Handle date fields
      if (['Processed_Date', 'Entry_Date', 'Modified_Date'].includes(this.processSortColumn)) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      // 🔢 Handle number fields like ID
      if (['Material_Process_Id', 'Quantity_Processed', 'Material_Id'].includes(this.processSortColumn)) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return this.processSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.processSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updateProcessPagination() {
    this.totalProcessPages = Math.ceil(this.filteredProcessData.length / this.processPageSize);
    if (this.currentProcessPage > this.totalProcessPages) this.currentProcessPage = this.totalProcessPages || 1;

    const startIndex = (this.currentProcessPage - 1) * this.processPageSize;
    this.pagedProcessData = this.filteredProcessData.slice(startIndex, startIndex + this.processPageSize);

    console.log('Paged Process Data:', this.pagedProcessData);
  }

  goToProcessPage(page: number) {
    if (page < 1 || page > this.totalProcessPages) return;
    this.currentProcessPage = page;
    this.updateProcessPagination();
  }

  renderProcessDonutChart() {
    if (this.donutChartProcess) this.donutChartProcess.destroy();

    // Aggregate quantity processed by Material Description
    const quantityMap = new Map<string, number>();
    this.filteredProcessData.forEach(p => {
      const currentQty = quantityMap.get(p.Material_Desc) ?? 0;
      quantityMap.set(p.Material_Desc, currentQty + p.Quantity_Processed);
    });

    const labels = Array.from(quantityMap.keys());
    const quantities = labels.map(label => quantityMap.get(label) ?? 0);

    if (!this.donutChartProcessRef) return;
    const canvas = this.donutChartProcessRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChartProcess = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: quantities,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Quantity Processed by Material' }
        }
      }
    });
  }

  renderProcessQuantityOverTimeLineChart() {
  if (this.processLineChart) this.processLineChart.destroy();

  if (!this.materialProcessData || this.materialProcessData.length === 0) return;

  // Step 1: Aggregate total quantity per Processed_Date
  const qtyByDate = new Map<string, number>();

  this.materialProcessData.forEach(item => {
    const date = item.Processed_Date; // assuming 'YYYY-MM-DD' string
    const qty = Number(item.Quantity_Processed) || 0;
    qtyByDate.set(date, (qtyByDate.get(date) ?? 0) + qty);
  });

  // Step 2: Sort dates chronologically
  const sortedDates = Array.from(qtyByDate.keys()).sort();

  // Step 3: Prepare data arrays
  const quantities = sortedDates.map(date => qtyByDate.get(date) ?? 0);

  // Step 4: Get canvas context
  if (!this.processLineChartRef) return;
  const canvas = this.processLineChartRef.nativeElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Step 5: Create line chart
  this.processLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Quantity Processed',
        data: quantities,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54,162,235,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: 'Processed Date' },
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' }
        },
        y: {
          title: { display: true, text: 'Quantity Processed' },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });
}
generateReport(fromDate?: string, toDate?: string, sortOrder: 'asc' | 'desc' = 'asc'): void {
  const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
  const end = toDate ? new Date(toDate) : new Date();

  let reportData = this.materialProcessData.filter(p => {
    const date = new Date(p.Processed_Date);
    return date >= start && date <= end;
  });

  reportData = reportData.sort((a, b) => {
    const valA = new Date(a.Processed_Date).getTime();
    const valB = new Date(b.Processed_Date).getTime();
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalQty = reportData.reduce((sum, p) => sum + Number(p.Quantity_Processed || 0), 0);
  const totalCount = reportData.length;

  // Donut Chart Data
  const donutMap = new Map<string, number>();
  reportData.forEach(p => {
    donutMap.set(p.Material_Desc, (donutMap.get(p.Material_Desc) ?? 0) + p.Quantity_Processed);
  });

  const donutChartData = {
    labels: Array.from(donutMap.keys()),
    datasets: [{
      data: Array.from(donutMap.values()),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }]
  };

  // Line Chart Data
  const lineMap = new Map<string, number>();
  reportData.forEach(p => {
    lineMap.set(p.Processed_Date, (lineMap.get(p.Processed_Date) ?? 0) + p.Quantity_Processed);
  });
  const lineDates = Array.from(lineMap.keys()).sort();
  const lineChartData = {
    labels: lineDates,
    datasets: [{
      label: 'Quantity Processed',
      data: lineDates.map(d => lineMap.get(d)),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54,162,235,0.2)',
      fill: true,
      tension: 0.3
    }]
  };

  const printContents = `
  <html>
  <head>
    <title>Material Process Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: Arial;
        padding: 20px;
        background: #fff;
        margin: 0;
        text-align: center;
      }
      .container {
        max-width: 1000px;
        margin: 0 auto;
        border: 1px solid #ccc;
        padding: 20px;
      }
      h2 {
        margin-bottom: 10px;
      }
      .summary {
        font-size: 13px;
        margin-bottom: 20px;
      }
      .summary p {
        margin: 5px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 12px;
      }
      th, td {
        border: 1px solid #444;
        padding: 6px;
        text-align: center;
      }
      th {
        background: #f0f0f0;
      }
      .charts {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 30px;
        margin-top: 30px;
      }
      canvas {
        width: 400px !important;
        height: 300px !important;
      }
      @media print {
        body {
          zoom: 90%;
        }
        .container {
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Material Process Report</h2>
      <div class="summary">
        <p><strong>System:</strong> Garments Management System</p>
        <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${fromDate || 'N/A'} &nbsp; <strong>To:</strong> ${toDate || 'N/A'}</p>
        <p><strong>Total Processes:</strong> ${totalCount}</p>
        <p><strong>Total Quantity:</strong> ${totalQty}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Material ID</th>
            <th>Material</th>
            <th>Color</th>
            <th>Quantity</th>
            <th>Processed Date</th>
            <th>Entry Date</th>
            <th>Modified Date</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.map(p => `
            <tr>
              <td>${p.Material_Process_Id}</td>
              <td>${p.Material_Id}</td>
              <td>${p.Material_Desc}</td>
              <td>${p.Color}</td>
              <td>${p.Quantity_Processed}</td>
              <td>${p.Processed_Date}</td>
              <td>${p.Entry_Date}</td>
              <td>${p.Modified_Date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="charts">
        <canvas id="processDonutCanvas"></canvas>
        <canvas id="processLineCanvas"></canvas>
      </div>
    </div>
    <script>
      const donutData = ${JSON.stringify(donutChartData)};
      const donutCtx = document.getElementById('processDonutCanvas').getContext('2d');
      new Chart(donutCtx, {
        type: 'doughnut',
        data: donutData,
        options: {
          plugins: {
            title: { display: true, text: 'Processed by Material' },
            legend: { position: 'right' }
          }
        }
      });

      const lineData = ${JSON.stringify(lineChartData)};
      const lineCtx = document.getElementById('processLineCanvas').getContext('2d');
      new Chart(lineCtx, {
        type: 'line',
        data: lineData,
        options: {
          plugins: {
            title: { display: true, text: 'Quantity Over Time' }
          },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }
          }
        }
      });

      setTimeout(() => window.print(), 1000);
    </script>
  </body>
</html>

`;


  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContents);
    printWindow.document.close();
  }
}

}

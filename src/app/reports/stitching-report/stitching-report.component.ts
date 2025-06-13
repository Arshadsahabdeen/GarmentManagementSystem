import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StitchingDetailsService } from '../../services/stitching-details.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-stitching-report',
  templateUrl: './stitching-report.component.html',
  standalone: true,
  styleUrls: ['./stitching-report.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class StitchingReportComponent implements OnInit {

  filteredStitchingData: any[] = [];
  filterStitchingFromDate: string = '';
  filterStitchingToDate: string = '';
  stitchingDetailsData: any[] = [];
  pagedStitchingData: any[] = [];
  currentStitchingPage = 1;
  stitchingPageSize = 10;
  totalStitchingPages = 1;
  stitchingSortColumn: string = 'Stitching_Details_Id';
  stitchingSortDirection: 'asc' | 'desc' = 'asc';

  availableMaterials: string[] = [];
  availableQualityStatuses: string[] = [];
  availableStitchingStatuses: string[] = [];

  selectedMaterial: string = '';
  selectedQualityStatus: string = '';
  selectedStitchingStatus: string = '';


  @ViewChild('donutChartStitching') donutChartStitchingRef!: ElementRef<HTMLCanvasElement>;
  donutChartStitching: Chart | undefined;

  constructor(private stitchingService: StitchingDetailsService) {}

  ngOnInit() {
    this.loadStitchingDetailsData();
    window.addEventListener('generate-stitching-report', (event: any) => {
    const filters = event.detail;
    this.generateReport(filters.fromDate, filters.toDate, filters.sortOrder);
  });
  }

  loadStitchingDetailsData() {
    this.stitchingService.getAll().subscribe((data) => {
      this.stitchingDetailsData = data;
      this.filteredStitchingData = [...data];
      this.totalStitchingPages = Math.ceil(this.filteredStitchingData.length / this.stitchingPageSize);
      this.currentStitchingPage = 1;
      this.pagedStitchingData = this.filteredStitchingData.slice(0, this.stitchingPageSize);
      this.extractFilterOptions();
      this.renderStitchingDonutChart();
    });
  }

  filterStitchingByDate() {
    this.currentStitchingPage = 1;

    const fromDate = this.filterStitchingFromDate ? new Date(this.filterStitchingFromDate) : new Date('1970-01-01');
    const toDate = this.filterStitchingToDate ? new Date(this.filterStitchingToDate) : new Date();

    this.filteredStitchingData = this.stitchingDetailsData.filter(s => {
      const stitchingDate = new Date(s.Stitching_Date);
      return stitchingDate >= fromDate && stitchingDate <= toDate;
    });

    this.applyStitchingSorting();
    this.updateStitchingPagination();
  }

  extractFilterOptions() {
  const materialSet = new Set<string>();
  const qualityCheckSet = new Set<string>(['Passed', 'Failed']);
  const stitchingStatusSet = new Set<string>(['Stitched', 'Pending']);

  this.stitchingDetailsData.forEach(item => {
    if (item.Material_Desc) {
      materialSet.add(item.Material_Desc.toLowerCase());
    }
    if (item.Stitching_Status === 1) {
      stitchingStatusSet.add('Stitched');
    } else if (item.Stitching_Status === 0) {
      stitchingStatusSet.add('Pending');
    }

    // Quality Check
    if (item.Quality_Check === 1) {
      qualityCheckSet.add('Passed');
    } else if (item.Quality_Check === 0) {
      qualityCheckSet.add('Failed');
    }
  });

  this.availableMaterials = Array.from(materialSet);
  this.availableQualityStatuses = Array.from(qualityCheckSet);
  this.availableStitchingStatuses = Array.from(stitchingStatusSet);
}

applyFilters() {
  this.filteredStitchingData = this.stitchingDetailsData.filter(item => {
    // Handle Material filter (case-insensitive)
    const materialMatch = this.selectedMaterial
      ? (item.Material_Desc || '').toLowerCase() === this.selectedMaterial.toLowerCase()
      : true;

    // Handle Quality Check filter
    const qualityMatch = this.selectedQualityStatus
      ? (this.selectedQualityStatus === 'Passed' &&
          (item.Quality_Check_Status === 1 || item.Quality_Check_Status === '1' || item.Quality_Check_Status === true)) ||
        (this.selectedQualityStatus === 'Failed' &&
          (item.Quality_Check_Status === 0 || item.Quality_Check_Status === '0' || item.Quality_Check_Status === false))
      : true;

    const statusMatch = this.selectedStitchingStatus
      ? (this.selectedStitchingStatus === 'Stitched' &&
          (item.Stitching_Status === 1 || item.Stitching_Status === '1' || item.Stitching_Status === true)) ||
        (this.selectedStitchingStatus === 'Pending' &&
          (item.Stitching_Status === 0 || item.Stitching_Status === '0' || item.Stitching_Status === false))
      : true;

    return materialMatch && qualityMatch && statusMatch;
  });
  this.currentStitchingPage = 1;
  this.updateStitchingPagination();
}


clearFilters() {
  this.selectedMaterial = '';
  this.selectedQualityStatus = '';
  this.selectedStitchingStatus = '';
  this.applyFilters();
}


  sortStitchingTable(column: string) {
    if (this.stitchingSortColumn === column) {
      this.stitchingSortDirection = this.stitchingSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.stitchingSortColumn = column;
      this.stitchingSortDirection = 'asc';
    }
    this.applyStitchingSorting();
    this.updateStitchingPagination();
  }

  applyStitchingSorting() {
    this.filteredStitchingData.sort((a, b) => {
      let valA = a[this.stitchingSortColumn];
      let valB = b[this.stitchingSortColumn];

      // Handle date fields
      if (['Stitching_Date', 'Entry_Date', 'Modified_Date'].includes(this.stitchingSortColumn)) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      // Handle numeric fields
      if (['Stitching_Details_Id', 'Material_Process_Id', 'Size', 'Quantity_Stitched', 'Tailor_Id'].includes(this.stitchingSortColumn)) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return this.stitchingSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.stitchingSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updateStitchingPagination() {
    this.totalStitchingPages = Math.ceil(this.filteredStitchingData.length / this.stitchingPageSize);
    if (this.currentStitchingPage > this.totalStitchingPages) this.currentStitchingPage = this.totalStitchingPages || 1;

    const startIndex = (this.currentStitchingPage - 1) * this.stitchingPageSize;
    this.pagedStitchingData = this.filteredStitchingData.slice(startIndex, startIndex + this.stitchingPageSize);

    console.log('Paged Stitching Details Data:', this.pagedStitchingData);
  }

  goToStitchingPage(page: number) {
    if (page < 1 || page > this.totalStitchingPages) return;
    this.currentStitchingPage = page;
    this.updateStitchingPagination();
  }

  renderStitchingDonutChart() {
    if (this.donutChartStitching) this.donutChartStitching.destroy();

    // Aggregate quantity stitched by Material Description
    const quantityMap = new Map<string, number>();
    this.filteredStitchingData.forEach(s => {
      const currentQty = quantityMap.get(s.Material_Desc) ?? 0;
      quantityMap.set(s.Material_Desc, currentQty + s.Quantity_Stitched);
    });

    const labels = Array.from(quantityMap.keys());
    const quantities = labels.map(label => quantityMap.get(label) ?? 0);

    if (!this.donutChartStitchingRef) return;
    const canvas = this.donutChartStitchingRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChartStitching = new Chart(ctx, {
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
          title: { display: true, text: 'Quantity Stitched by Material' }
        }
      }
    });
  }
  generateReport(fromDate?: string, toDate?: string, sortOrder: 'asc' | 'desc' = 'asc'): void {
  const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
  const end = toDate ? new Date(toDate) : new Date();

  let reportData = this.stitchingDetailsData.filter(s => {
    const date = new Date(s.Stitching_Date);
    return date >= start && date <= end;
  });

  reportData = reportData.sort((a, b) => {
    const valA = new Date(a.Stitching_Date).getTime();
    const valB = new Date(b.Stitching_Date).getTime();
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalQty = reportData.reduce((sum, s) => sum + Number(s.Quantity_Stitched || 0), 0);
  const totalCount = reportData.length;

  // Donut Chart Data
  const donutMap = new Map<string, number>();
  reportData.forEach(s => {
    donutMap.set(s.Material_Description, (donutMap.get(s.Material_Description) ?? 0) + s.Quantity_Stitched);
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
  reportData.forEach(s => {
    lineMap.set(s.Stitching_Date, (lineMap.get(s.Stitching_Date) ?? 0) + s.Quantity_Stitched);
  });
  const lineDates = Array.from(lineMap.keys()).sort();
  const lineChartData = {
    labels: lineDates,
    datasets: [{
      label: 'Quantity Stitched',
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
    <title>Stitching Report</title>
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
          zoom: 85%;
        }
        .container {
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Stitching Report</h2>
      <div class="summary">
        <p><strong>System:</strong> Stitching Management System</p>
        <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${fromDate || 'N/A'} &nbsp; <strong>To:</strong> ${toDate || 'N/A'}</p>
        <p><strong>Total Processes:</strong> ${totalCount}</p>
        <p><strong>Total Quantity Stitched:</strong> ${totalQty}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stitching ID</th>
            <th>Material Process ID</th>
            <th>Material Description</th>
            <th>Size</th>
            <th>Stitching Date</th>
            <th>Stitching Status</th>
            <th>Quantity Stitched</th>
            <th>Tailor ID</th>
            <th>Quality Check</th>
            <th>Entry Date</th>
            <th>Modified Date</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.map(s => `
            <tr>
              <td>${s.Stitching_Details_Id}</td>
              <td>${s.Material_Process_Id}</td>
              <td>${s.Material_Desc}</td>
              <td>${s.Size}</td>
              <td>${s.Stitching_Date}</td>
              <td>${s.Stitching_Status}</td>
              <td>${s.Quantity_Stitched}</td>
              <td>${s.Tailor_Id}</td>
              <td>${s.Quality_Check_Status? 'Passed' : 'Failed'}</td>
              <td>${s.Entry_Date}</td>
              <td>${s.Modified_Date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="charts">
        <canvas id="stitchingDonutCanvas"></canvas>
        <canvas id="stitchingLineCanvas"></canvas>
      </div>
    </div>
    <script>
      const donutData = ${JSON.stringify(donutChartData)};
      const donutCtx = document.getElementById('stitchingDonutCanvas').getContext('2d');
      new Chart(donutCtx, {
        type: 'doughnut',
        data: donutData,
        options: {
          plugins: {
            title: { display: true, text: 'Stitched by Material' },
            legend: { position: 'right' }
          }
        }
      });

      const lineData = ${JSON.stringify(lineChartData)};
      const lineCtx = document.getElementById('stitchingLineCanvas').getContext('2d');
      new Chart(lineCtx, {
        type: 'line',
        data: lineData,
        options: {
          plugins: {
            title: { display: true, text: 'Quantity Stitched Over Time' }
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

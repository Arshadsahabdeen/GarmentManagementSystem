import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TailorService } from '../../services/tailor.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-tailor-report',
  templateUrl: './tailor-report.component.html',
  standalone: true,
  styleUrls: ['./tailor-report.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class TailorReportComponent implements OnInit {
  tailorData: any[] = [];
  filteredTailorData: any[] = [];
  pagedTailorData: any[] = [];
  currentTailorPage = 1;
  tailorPageSize = 10;
  totalTailorPages = 1;
  tailorSortColumn: string = 'Tailor_Id';
  tailorSortDirection: 'asc' | 'desc' = 'asc';
  filterTailorFromDate = '';
  filterTailorToDate = '';
  filterName: string = '';
  filterContact: string = '';
  filterGender: string = '';


  @ViewChild('donutChartTailor') donutChartTailorRef!: ElementRef<HTMLCanvasElement>;
  donutChartTailor: Chart | undefined;

  constructor(private tailorService: TailorService) {}

  ngOnInit() {
    this.loadTailorData();
    window.addEventListener('generate-tailor-report', (event: any) => {
    const filters = event.detail;
    this.generateReport(filters.fromDate, filters.toDate, filters.sortOrder);
  });
  }
loadTailorData() {
    this.tailorService.getAllTailors().subscribe((data) => {
      this.tailorData = data;
      this.filteredTailorData = [...data];
      this.totalTailorPages = Math.ceil(this.filteredTailorData.length / this.tailorPageSize);
      this.currentTailorPage = 1;
      this.pagedTailorData = this.filteredTailorData.slice(0, this.tailorPageSize);
      this.renderTailorDonutChart();
    });
  }

  filterTailorByDate() {
    this.currentTailorPage = 1;

    const fromDate = this.filterTailorFromDate ? new Date(this.filterTailorFromDate) : new Date('1970-01-01');
    const toDate = this.filterTailorToDate ? new Date(this.filterTailorToDate) : new Date();

    this.filteredTailorData = this.tailorData.filter(t => {
      const joiningDate = new Date(t.Date_of_Joining);
      return joiningDate >= fromDate && joiningDate <= toDate;
    });

    this.applyTailorSorting();
    this.updateTailorPagination();
  }

  sortTailorTable(column: string) {
    if (this.tailorSortColumn === column) {
      this.tailorSortDirection = this.tailorSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.tailorSortColumn = column;
      this.tailorSortDirection = 'asc';
    }
    this.applyTailorSorting();
    this.updateTailorPagination();
  }

  applyTailorSorting() {
    this.filteredTailorData.sort((a, b) => {
      let valA = a[this.tailorSortColumn];
      let valB = b[this.tailorSortColumn];

      if (['Date_of_Joining', 'Entry_Date', 'Modified_Date'].includes(this.tailorSortColumn)) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (['Tailor_Id', 'Age', 'Experience'].includes(this.tailorSortColumn)) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return this.tailorSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.tailorSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  applyTailorFilters() {
  this.filteredTailorData = this.tailorData.filter(t => {
    const nameMatch = !this.filterName || t.Tailor_Name.toLowerCase().includes(this.filterName.toLowerCase());
    const contactMatch = !this.filterContact || t.Contact.toLowerCase().includes(this.filterContact.toLowerCase());
    const genderMatch = !this.filterGender || t.Gender === this.filterGender;

    return nameMatch && contactMatch && genderMatch;
  });

  this.applyTailorSorting();
  this.updateTailorPagination();
}

resetTailorFilters() {
  this.filterName = '';
  this.filterContact = '';
  this.filterGender = '';
  this.filteredTailorData = [...this.tailorData];
  this.applyTailorSorting();
  this.updateTailorPagination();
}



  updateTailorPagination() {
    this.totalTailorPages = Math.ceil(this.filteredTailorData.length / this.tailorPageSize);
    if (this.currentTailorPage > this.totalTailorPages) this.currentTailorPage = this.totalTailorPages || 1;

    const start = (this.currentTailorPage - 1) * this.tailorPageSize;
    this.pagedTailorData = this.filteredTailorData.slice(start, start + this.tailorPageSize);

    console.log('📄 Paged Tailor Data:', this.pagedTailorData);
  }

  goToTailorPage(page: number) {
    if (page < 1 || page > this.totalTailorPages) return;
    this.currentTailorPage = page;
    this.updateTailorPagination();
  }

  renderTailorDonutChart() {
    if (this.donutChartTailor) this.donutChartTailor.destroy();

    const genderMap = new Map<string, number>();
    this.filteredTailorData.forEach(t => {
      const gender = t.Gender || 'Other';
      genderMap.set(gender, (genderMap.get(gender) ?? 0) + 1);
    });

    const labels = Array.from(genderMap.keys());
    const values = labels.map(label => genderMap.get(label) ?? 0);

    const canvas = this.donutChartTailorRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    this.donutChartTailor = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Tailors by Gender' }
        }
      }
    });
  }
  generateReport(fromDate?: string, toDate?: string, sortOrder: 'asc' | 'desc' = 'asc'): void {
  const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
  const end = toDate ? new Date(toDate) : new Date();

  let reportData = this.tailorData.filter(t => {
    const date = new Date(t.Date_of_Joining);
    return date >= start && date <= end;
  });

  reportData = reportData.sort((a, b) => {
    const valA = new Date(a.Date_of_Joining).getTime();
    const valB = new Date(b.Date_of_Joining).getTime();
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalCount = reportData.length;

  // Prepare data for the donut chart
  const genderMap = new Map<string, number>();
  reportData.forEach(t => {
    const gender = t.Gender || 'Other';
    genderMap.set(gender, (genderMap.get(gender) ?? 0) + 1);
  });

  const labels = Array.from(genderMap.keys());
  const values = labels.map(label => genderMap.get(label) ?? 0);

  const printContents = `
  <html>
  <head>
    <title>Tailor Report</title>
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
      <h2>Tailor Report</h2>
      <div class="summary">
        <p><strong>System:</strong> Tailor Management System</p>
        <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${fromDate || 'N/A'} &nbsp; <strong>To:</strong> ${toDate || 'N/A'}</p>
        <p><strong>Total Tailors:</strong> ${totalCount}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Tailor ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Contact</th>
            <th>Experience (Years)</th>
            <th>Address</th>
            <th>Date of Joining</th>
            <th>Entry Date</th>
            <th>Modified Date</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.map(t => `
            <tr>
              <td>${t.Tailor_Id}</td>
              <td>${t.Tailor_Name}</td>
              <td>${t.Age}</td>
              <td>${t.Gender}</td>
              <td>${t.Contact}</td>
              <td>${t.Experience}</td>
              <td>${t.Address}</td>
              <td>${t.Date_of_Joining}</td>
              <td>${t.Entry_Date}</td>
              <td>${t.Modified_Date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="charts">
        <canvas id="tailorDonutCanvas"></canvas>
      </div>
    </div>
    <script>
      const donutData = {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          data: ${JSON.stringify(values)},
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#9966FF']
        }]
      };

      const ctx = document.getElementById('tailorDonutCanvas').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: donutData,
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            title: { display: true, text: 'Tailors by Gender' }
          }
        }
      });
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

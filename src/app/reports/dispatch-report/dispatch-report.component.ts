import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DispatchService } from '../../services/dispatch.service';
import { Chart, registerables } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dispatch-report',
  templateUrl: './dispatch-report.component.html',
  standalone: true,
  styleUrls: ['./dispatch-report.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class DispatchReportComponent implements OnInit {
  dispatchData: any[] = [];
  filteredDispatchData: any[] = [];
  pagedDispatchData: any[] = [];
  filterDispatchFromDate: string = '';
  filterDispatchToDate: string = '';
  dispatchSortColumn: string = '';
  dispatchSortDirection: 'asc' | 'desc' = 'asc';
  dispatchPageSize: number = 10;
  currentDispatchPage: number = 1;
  totalDispatchPages: number = 1;
  filterReceiverName: string = '';
  filterDispatchStatus: string = '';

  @ViewChild('donutChartDispatch')
  donutChartDispatchRef!: ElementRef<HTMLCanvasElement>;
  donutChartDispatch: Chart | undefined;

  constructor(private dispatchService: DispatchService) {}

  ngOnInit() {
    this.loadDispatchData();

    window.addEventListener('generate-dispatch-report', (e: any) => {
      const { fromDate, toDate, sortOrder, status } = e.detail;
      this.generateReport(fromDate, toDate, sortOrder, status);
    });
  }

  loadDispatchData() {
    this.dispatchService.getAllDispatches().subscribe((data) => {
      this.dispatchData = data;
      this.filteredDispatchData = [...data];
      this.applyDispatchSorting();
      this.applyDispatchFilters();
      this.updateDispatchPagination();
      this.renderDispatchDonutChart();
    });
  }

  filterDispatchByDate() {
    this.currentDispatchPage = 1;
    const fromDate = this.filterDispatchFromDate
      ? new Date(this.filterDispatchFromDate)
      : new Date('1970-01-01');
    const toDate = this.filterDispatchToDate
      ? new Date(this.filterDispatchToDate)
      : new Date();

    this.filteredDispatchData = this.dispatchData.filter((d) => {
      const dispatchDate = new Date(d.Dispatch_Date);
      return dispatchDate >= fromDate && dispatchDate <= toDate;
    });

    this.applyDispatchSorting();
    this.updateDispatchPagination();
  }
  applyDispatchFilters() {
  this.filteredDispatchData = this.dispatchData.filter((d) => {
    const receiverName = d.Receiver_Name ? d.Receiver_Name.toLowerCase() : '';
    const status = d.Dispatch_Status ? String(d.Dispatch_Status) : '';

    const nameMatch = !this.filterReceiverName || receiverName.includes(this.filterReceiverName.toLowerCase());
    const statusMatch = !this.filterDispatchStatus || status === this.filterDispatchStatus;

    return nameMatch && statusMatch;
  });

  this.applyDispatchSorting();
  this.updateDispatchPagination();
}


  sortDispatchTable(column: string) {
    if (this.dispatchSortColumn === column) {
      this.dispatchSortDirection =
        this.dispatchSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.dispatchSortColumn = column;
      this.dispatchSortDirection = 'asc';
    }
    this.applyDispatchSorting();
    this.updateDispatchPagination();
  }

  applyDispatchSorting() {
    this.filteredDispatchData.sort((a, b) => {
      let valA = a[this.dispatchSortColumn];
      let valB = b[this.dispatchSortColumn];

      if (
        [
          'Dispatch_Id',
          'Quantity_Dispatched',
          'Price',
          'Stitching_Details_Id',
        ].includes(this.dispatchSortColumn)
      ) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (
        ['Dispatch_Date', 'Entry_Date', 'Modified_Date'].includes(
          this.dispatchSortColumn
        )
      ) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return this.dispatchSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.dispatchSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updateDispatchPagination() {
    this.totalDispatchPages = Math.ceil(
      this.filteredDispatchData.length / this.dispatchPageSize
    );
    if (this.currentDispatchPage > this.totalDispatchPages)
      this.currentDispatchPage = this.totalDispatchPages || 1;

    const start = (this.currentDispatchPage - 1) * this.dispatchPageSize;
    this.pagedDispatchData = this.filteredDispatchData.slice(
      start,
      start + this.dispatchPageSize
    );
  }

  goToDispatchPage(page: number) {
    if (page < 1 || page > this.totalDispatchPages) return;
    this.currentDispatchPage = page;
    this.updateDispatchPagination();
  }
  resetDispatchFilters() {
    this.filterReceiverName = '';
    this.filterDispatchStatus = '';
    this.filteredDispatchData = [...this.dispatchData];
    this.applyDispatchSorting();
    this.updateDispatchPagination();
  }

  renderDispatchDonutChart() {
    if (this.donutChartDispatch) this.donutChartDispatch.destroy();

    const quantityMap = new Map<string, number>();
    this.filteredDispatchData.forEach((dispatch) => {
      const material = dispatch.Material_Desc;
      const qty = dispatch.Quantity_Dispatched;
      quantityMap.set(material, (quantityMap.get(material) ?? 0) + qty);
    });

    const labels = Array.from(quantityMap.keys());
    const quantities = labels.map((label) => quantityMap.get(label) ?? 0);

    const ctx = this.donutChartDispatchRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.donutChartDispatch = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: quantities,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Quantity Dispatched by Material' },
        },
      },
    });
  }
  generateReport(
    fromDate?: string,
    toDate?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    status: string = ''
  ): void {
    const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const end = toDate ? new Date(toDate) : new Date();

    // Filter
    let reportData = this.dispatchData.filter((d) => {
      const date = new Date(d.Dispatch_Date);
      const matchDate = date >= start && date <= end;
      const matchStatus =
        status === '' ? true : String(d.Dispatch_Status) === status;
      return matchDate && matchStatus;
    });

    // Sort
    reportData = reportData.sort((a, b) => {
      const valA = new Date(a.Dispatch_Date).getTime();
      const valB = new Date(b.Dispatch_Date).getTime();
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    // Totals
    const totalQty = reportData.reduce(
      (sum, m) => sum + Number(m.Quantity_Dispatched || 0),
      0
    );
    const totalPrice = reportData.reduce(
      (sum, m) => sum + Number(m.Price || 0),
      0
    );
    const totalCount = reportData.length;

    // Chart Data
    const quantityMap = new Map<string, number>();
    reportData.forEach((dispatch) => {
      const material = dispatch.Material_Desc;
      quantityMap.set(
        material,
        (quantityMap.get(material) ?? 0) + dispatch.Quantity_Dispatched
      );
    });

    const chartData = {
      labels: Array.from(quantityMap.keys()),
      datasets: [
        {
          data: Array.from(quantityMap.values()),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };

    // HTML Report
    const printContents = `
  <html>
    <head>
      <title>Dispatch Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 30px;
          text-align: center;
          background-color: #fff;
        }
        .report-wrapper {
          border: 1px solid #ccc;
          padding: 20px;
          max-width: 95%;
          margin: auto;
        }
        h2 {
          margin-bottom: 10px;
        }
        .summary {
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #333;
          padding: 6px;
          text-align: center;
        }
        th {
          background-color: #f0f0f0;
        }
        .chart-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 30px;
        }
        canvas {
          max-width: 500px;
          max-height: 400px;
        }
        @media print {
          body {
            zoom: 90%;
          }
          .report-wrapper {
            page-break-inside: avoid;
          }
        }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
      <div class="report-wrapper">
        <h2>Dispatch Report</h2>
        <div class="summary">
  <p><strong>System:</strong> Garments Management System</p>
  <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>From:</strong> ${fromDate || 'N/A'} <strong>To:</strong> ${
      toDate || 'N/A'
    }</p>
  <p><strong>Total Dispatches:</strong> ${totalCount}</p>
  <p><strong>Total Quantity:</strong> ${totalQty}</p>
  <p><strong>Total Price:</strong> ₹${totalPrice.toFixed(2)}</p>
</div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Stitching ID</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Receiver</th>
              <th>Status</th>
              <th>Dispatch Date</th>
            </tr>
          </thead>
          <tbody>
            ${reportData
              .map(
                (d) => `
              <tr>
                <td>${d.Dispatch_Id}</td>
                <td>${d.Stitching_Details_Id}</td>
                <td>${d.Material_Desc}</td>
                <td>${d.Quantity_Dispatched}</td>
                <td>₹${d.Price}</td>
                <td>${d.Receiver_Name}</td>
                <td>${d.Dispatch_Status ? 'Dispatched' : 'Pending'}</td>
                <td>${d.Dispatch_Date}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="chart-container">
          <canvas id="dispatchDonutChartCanvas"></canvas>
        </div>
      </div>
      <script>
        const chartData = ${JSON.stringify(chartData)};
        const chartConfig = {
          type: 'doughnut',
          data: chartData,
          options: {
            responsive: false,
            plugins: {
              legend: { position: 'right' },
              title: { display: true, text: 'Quantity Dispatched by Material' }
            }
          }
        };
        window.onload = function () {
          const ctx = document.getElementById('dispatchDonutChartCanvas').getContext('2d');
          new Chart(ctx, chartConfig);
          setTimeout(() => window.print(), 1000);
        };
      </script>
    </body>
  </html>
  `;
    console.log('Report Data:', reportData);

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContents);
      printWindow.document.close();
    }
  }
}

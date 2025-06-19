import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-material-report',
  templateUrl: './material-report.component.html',
  styleUrls: ['./material-report.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class MaterialReportComponent implements OnInit {
  materials: any[] = [];
  filteredMaterials: any[] = [];
  filterFromDate: string = '';
  filterToDate: string = '';
  filteredMaterialData: any[] = [];
  materialBarChartCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Sorting
  sortColumn: string = 'Material_Id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  pagedMaterials: any[] = [];

  selectedPatterns: string = '';
  selectedMaterial: string = '';
  materialList: string[] = [];
  availablePatterns: string[] = [];

  @ViewChild('donutChartMaterial')
  donutChartMaterialRef!: ElementRef<HTMLCanvasElement>;
  donutChartMaterials: Chart | undefined;

  @ViewChild('materialBarChart')
  materialBarChartRef!: ElementRef<HTMLCanvasElement>;
  materialBarChart: Chart | undefined;

  constructor(private materialService: MaterialService) {}

  ngOnInit() {
    this.loadMaterialData();

    window.addEventListener('generate-material-report', (event: any) => {
      const filters = event.detail;
      this.generateReport(filters.fromDate, filters.toDate, filters.sortOrder);
    });
  }
  loadMaterialData() {
    this.materialService.getMaterials().subscribe((data) => {
      this.materials = data;
      this.filteredMaterials = [...data];
      this.materialList = [...new Set(data.map((item) => item.Material_Desc))];
      this.extractAvailablePatterns();
      this.extractMaterialNames();
      this.applySorting();
      this.updatePagination();
      this.renderMaterialDonutChart();
      this.renderMaterialBarChart();
    });
  }
  // Filters the materials by selected material and pattern (case-insensitive)
  applyFilters() {
    this.filteredMaterials = this.materials.filter((material) => {
      const matchesMaterial = this.selectedMaterial
        ? material.Material_Desc.toLowerCase() ===
          this.selectedMaterial.toLowerCase()
        : true;

      const matchesPattern = this.selectedPatterns
        ? material.Pattern.toLowerCase().includes(
            this.selectedPatterns.toLowerCase()
          )
        : true;

      return matchesMaterial && matchesPattern;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  // Extracts unique patterns for dropdown (case-insensitive)
  extractAvailablePatterns() {
    const patterns = new Set<string>();
    this.materials.forEach((material) => {
      if (material.Pattern) {
        patterns.add(material.Pattern.toLowerCase());
      }
    });
    this.availablePatterns = Array.from(patterns).sort();
  }

  // Extracts unique material descriptions for dropdown (case-insensitive, no duplicates)
  extractMaterialNames() {
    const materialSet = new Set<string>();
    this.materials.forEach((material) => {
      if (material.Material_Desc) {
        materialSet.add(material.Material_Desc.toLowerCase());
      }
    });

    // Capitalize first letter for display
    this.materialList = Array.from(materialSet)
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
      .sort();
  }

  // Clears selected pattern filter
  clearFilters() {
    this.selectedMaterial = '';
    this.selectedPatterns = '';
    this.applyFilters();
  }

  filterMaterialsByDate() {
    const from = this.filterFromDate
      ? new Date(this.filterFromDate)
      : new Date('1970-01-01');
    const to = this.filterToDate ? new Date(this.filterToDate) : new Date();

    this.filteredMaterials = this.materials.filter((m) => {
      const pd = new Date(m.Purchase_Date);
      return pd >= from && pd <= to;
    });
    this.applySorting();
    this.currentPage = 1;
    this.updatePagination();
    this.renderMaterialDonutChart();
  }

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.updatePagination();
  }

  applySorting() {
    this.filteredMaterials.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredMaterials.length / this.pageSize);
    this.goToPage(this.currentPage);
  }

  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;

    this.currentPage = page;

    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMaterials = this.filteredMaterials.slice(startIndex, endIndex);
  }
  renderMaterialDonutChart() {
    if (this.donutChartMaterials) this.donutChartMaterials.destroy();

    if (!this.filteredMaterials || this.filteredMaterials.length === 0) return;

    const quantityMap = new Map<string, number>();

    this.filteredMaterials.forEach((m) => {
      const desc = m.Material_Desc.trim().toLowerCase();
      const qty = Number(m.Quantity) || 0;
      const currentQty = quantityMap.get(desc) ?? 0;
      quantityMap.set(desc, currentQty + qty);
    });

    const labels = Array.from(quantityMap.keys()).map(
      (label) => label.charAt(0).toUpperCase() + label.slice(1)
    );
    const quantities = labels.map(
      (label) => quantityMap.get(label.toLowerCase()) ?? 0
    );

    if (!this.donutChartMaterialRef) return;
    const canvas = this.donutChartMaterialRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChartMaterials = new Chart(ctx, {
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
          title: { display: true, text: 'Material Quantity Available' },
        },
      },
    });
  }

  renderMaterialBarChart() {
    if (this.materialBarChart) this.materialBarChart.destroy();

    if (!this.filteredMaterials || this.filteredMaterials.length === 0) return;

    const priceMap = new Map<string, number>();

    this.filteredMaterials.forEach((material) => {
      const desc = material.Material_Desc.trim().toLowerCase();
      const price = Number(material.Price) || 0;
      const currentPrice = priceMap.get(desc) ?? 0;
      priceMap.set(desc, currentPrice + price);
    });

    const labels = Array.from(priceMap.keys()).map(
      (label) => label.charAt(0).toUpperCase() + label.slice(1)
    );
    const prices = labels.map(
      (label) => priceMap.get(label.toLowerCase()) ?? 0
    );

    if (!this.materialBarChartRef) return;
    const canvas = this.materialBarChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.materialBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Price by Material',
            data: prices,
            backgroundColor: [
              '#4BC0C0',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#9966FF',
              '#FF9F40',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Total Price by Material Type' },
        },
        scales: {
          y: { beginAtZero: true },
          x: { title: { display: true, text: 'Material Description' } },
        },
      },
    });
  }
  generateReport(
    fromDate?: string,
    toDate?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): void {
    const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const end = toDate ? new Date(toDate) : new Date();

    // Filter and sort
    let reportData = this.materials.filter((m) => {
      const date = new Date(m.Purchase_Date);
      return date >= start && date <= end;
    });

    reportData = reportData.sort((a, b) => {
      const valA = new Date(a.Purchase_Date).getTime();
      const valB = new Date(b.Purchase_Date).getTime();
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    // Summaries
    const totalQty = reportData.reduce((sum, m) => {
      const qty = Number(m.Quantity);
      return isFinite(qty) ? sum + qty : sum;
    }, 0);

    const totalPrice = reportData.reduce((sum, m) => {
      const price = Number(m.Price);
      return isFinite(price) ? sum + price : sum;
    }, 0);

    function toTitleCase(str: string): string {
      return str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const allMaterialNames = [
      ...new Set(this.materials.map((m) => toTitleCase(m.Material_Desc))),
    ];
    const outOfStock = allMaterialNames.filter((name) => {
      const totalQty = reportData
        .filter((m) => toTitleCase(m.Material_Desc) === name)
        .reduce((sum, m) => sum + Number(m.Quantity || 0), 0);
      return totalQty === 0;
    });

    const materialMap = new Map<string, { qty: number; price: number }>();

    reportData.forEach((m) => {
      const desc = m.Material_Desc;
      if (!materialMap.has(desc)) materialMap.set(desc, { qty: 0, price: 0 });
      const val = materialMap.get(desc)!;
      val.qty += m.Quantity;
      val.price += m.Price;
    });

    // Chart data
    const chartLabels = Array.from(materialMap.keys());
    const quantityData = chartLabels.map(
      (label) => materialMap.get(label)!.qty
    );
    const priceData = chartLabels.map((label) => materialMap.get(label)!.price);

    const donutChartData = {
      labels: chartLabels,
      datasets: [
        {
          data: quantityData,
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

    const barChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: 'Total Price',
          data: priceData,
          backgroundColor: '#36A2EB',
        },
      ],
    };

    // Generate HTML
    const printContents = `
  <html>
    <head>
      <title>Material Master Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          background-color: #fff;
          text-align: center;
        }
        .report-wrapper {
          border: 1px solid #ccc;
          padding: 20px;
          max-width: 95%;
          margin: auto;
        }
        h2 {
          margin-bottom: 0;
        }
        .meta, .summary {
          margin-bottom: 20px;
          font-size: 13px;
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
          flex-wrap: wrap;
          gap: 30px;
        }
        canvas {
          max-width: 400px;
          max-height: 300px;
        }
        @media print {
          body {
            zoom: 85%;
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
        <h2>Material Master Report</h2>
        <div class="meta">
          <p><strong>System:</strong> Garments Management System</p>
          <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${fromDate || 'N/A'} <strong>To:</strong> ${
      toDate || 'N/A'
    }</p>
        </div>
        <div class="summary">
          <p><strong>Total Quantity:</strong> ${totalQty}</p>
          <p><strong>Total Price:</strong> ₹${
            isFinite(totalPrice) ? totalPrice.toFixed(2) : '0.00'
          }</p>
          <p><strong>Out of Stock:</strong> 
  ${outOfStock.length > 0 ? outOfStock.join(', ') : 'None'}
</p>

        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Color</th>
              <th>Pattern</th>
              <th>Purchase Date</th>
              <th>Entry Date</th>
              <th>Modified Date</th>
            </tr>
          </thead>
          <tbody>
            ${reportData
              .map(
                (m) => `
              <tr>
                <td>${m.Material_Id}</td>
                <td>${m.Material_Desc}</td>
                <td>${m.Quantity}</td>
                <td>${m.Price}</td>
                <td>${m.Color}</td>
                <td>${m.Pattern}</td>
                <td>${m.Purchase_Date}</td>
                <td>${m.Entry_Date}</td>
                <td>${m.Modified_Date}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="chart-container">
          <canvas id="donutChart"></canvas>
          <canvas id="barChart"></canvas>
        </div>
      </div>
      <script>
        const donutData = ${JSON.stringify(donutChartData)};
        const barData = ${JSON.stringify(barChartData)};
        window.onload = () => {
          new Chart(document.getElementById('donutChart'), {
            type: 'doughnut',
            data: donutData,
            options: {
              plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Quantity by Material Type' }
              }
            }
          });
          new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: barData,
            options: {
              plugins: {
                title: { display: true, text: 'Price by Material Type' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
          setTimeout(() => window.print(), 1000);
        };
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

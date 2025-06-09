import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ReportService, MaterialPriceSummary, StitchedByMaterial } from '../../services/report.service';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { MaterialProcessService } from '../../services/material-process.service';
import { StitchingDetailsService } from '../../services/stitching-details.service';
import { TailorService } from '../../services/tailor.service';
import { DispatchService } from '../../services/dispatch.service';

Chart.register(...registerables);

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportComponent implements OnInit {
  selectedReportSection: string = 'dashboard';

  // Material master data & filters
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

  // Material process data
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

  // Stitching details data
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

  // Tailor data
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

  // Dispatch data variables
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

  // Chart data
  priceProfitData: MaterialPriceSummary = {
    total_price_bought: 0,
    total_price_sold: 0,
    profit: 0,
  };
  stitchedByMaterialData: StitchedByMaterial[] = [];

  // Chart instances
  lineChart: Chart | undefined;
  donutChart: Chart | undefined;

  @ViewChild('donutChartMaterial') donutChartMaterialRef!: ElementRef<HTMLCanvasElement>;
  donutChartMaterials: Chart | undefined;

  @ViewChild('materialBarChart') materialBarChartRef!: ElementRef<HTMLCanvasElement>;
  materialBarChart: Chart | undefined;

  @ViewChild('donutChartProcess') donutChartProcessRef!: ElementRef<HTMLCanvasElement>;
  donutChartProcess: Chart | undefined;

  @ViewChild('donutChartStitching') donutChartStitchingRef!: ElementRef<HTMLCanvasElement>;
  donutChartStitching: Chart | undefined;

  @ViewChild('donutChartTailor') donutChartTailorRef!: ElementRef<HTMLCanvasElement>;
  donutChartTailor: Chart | undefined;

  @ViewChild('donutChartDispatch') donutChartDispatchRef!: ElementRef<HTMLCanvasElement>;
  donutChartDispatch: Chart | undefined;

  constructor(
    private reportService: ReportService,
    private router: Router,
    private materialService: MaterialService,
    private materialProcessService: MaterialProcessService,
    private stitchingDetailsService: StitchingDetailsService,
    private tailorService: TailorService,
    private dispatchService: DispatchService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.reportService.getPriceAndProfitSummary().subscribe(data => {
      this.priceProfitData = data;
      setTimeout(() => this.renderBarChart(), 0);
    });

    this.reportService.getQuantityStitchedByMaterial().subscribe(data => {
      this.stitchedByMaterialData = data;

      const stitchedData = data.map(d => ({
        materialDesc: d.materialDesc,
        quantityStitched: d.quantityStitched
      }));

      setTimeout(() => {
        this.renderDonutChart(stitchedData, 'donutChartStitched', 'Stitching Quantity by Material');
      }, 0);
    });
  }

  loadMaterialData() {
    this.materialService.getMaterials().subscribe(data => {
      this.materials = data;
      this.filteredMaterials = [...data];
      this.applySorting();
      this.updatePagination();
      this.renderMaterialDonutChart();
      this.renderMaterialBarChart();
    });
  }

  filterMaterialsByDate() {
    const from = this.filterFromDate ? new Date(this.filterFromDate) : new Date('1970-01-01');
    const to = this.filterToDate ? new Date(this.filterToDate) : new Date();

    this.filteredMaterials = this.materials.filter(m => {
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

  renderBarChart() {
    const data = this.priceProfitData;

    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!ctx) return;

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
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Price and Profit Summary' }
        },
        scales: { y: { beginAtZero: true } }
      }
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

    if (this.donutChart) this.donutChart.destroy();

    const labels = filteredData.map(d => d.materialDesc);
    const quantities = filteredData.map(d => d.quantityStitched);

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: quantities,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: chartTitle }
        }
      }
    });
  }

  renderMaterialDonutChart() {
    if (this.donutChartMaterials) this.donutChartMaterials.destroy();

    const quantityMap = new Map<string, number>();
    this.filteredMaterials.forEach(m => {
      const currentQty = quantityMap.get(m.Material_Desc) ?? 0;
      quantityMap.set(m.Material_Desc, currentQty + m.Quantity);
    });

    const labels = Array.from(quantityMap.keys());
    const quantities = labels.map(l => quantityMap.get(l) ?? 0);

    if (!this.donutChartMaterialRef) return;
    const canvas = this.donutChartMaterialRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChartMaterials = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: quantities,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Material Quantity Available' }
        }
      }
    });
  }
  renderMaterialBarChart() {
  if (this.materialBarChart) this.materialBarChart.destroy();

  if (!this.filteredMaterials || this.filteredMaterials.length === 0) return;

  // Step 1: Aggregate total price per material description
  const priceMap = new Map<string, number>();
  this.filteredMaterials.forEach(material => {
    const desc = material.Material_Desc.trim().toLowerCase();
    const currentPrice = priceMap.get(desc) ?? 0;
    priceMap.set(desc, currentPrice + material.Price);
  });

  // Step 2: Prepare labels and data
  const labels = Array.from(priceMap.keys()).map(label =>
    label.charAt(0).toUpperCase() + label.slice(1)
  );
  const prices = labels.map(label => priceMap.get(label.toLowerCase()) ?? 0);

  // Step 3: Get canvas context
  if (!this.materialBarChartRef) return;
  const canvas = this.materialBarChartRef.nativeElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Step 4: Render chart
  this.materialBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Price by Material',
        data: prices,
        backgroundColor: [
          '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Total Price by Material Type' }
      },
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Material Description' } }
      }
    }
  });
}


  loadMaterialProcessData() {
    this.materialProcessService.getAll().subscribe((data) => {
      console.log('✅ Raw Material Process Data:', data);
      this.materialProcessData = data;

      // Filter, paginate etc.
      this.filteredProcessData = [...data];
      this.totalProcessPages = Math.ceil(this.filteredProcessData.length / this.processPageSize);
      this.currentProcessPage = 1;
      this.pagedProcessData = this.filteredProcessData.slice(0, this.processPageSize);

      console.log('📊 Paged Material Process Data:', this.pagedProcessData);
      this.renderProcessDonutChart();
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

  loadStitchingDetailsData() {
    this.stitchingDetailsService.getAll().subscribe((data) => {
      console.log('✅ Raw Stitching Details Data:', data);
      this.stitchingDetailsData = data;

      // Filter, paginate etc.
      this.filteredStitchingData = [...data];
      this.totalStitchingPages = Math.ceil(this.filteredStitchingData.length / this.stitchingPageSize);
      this.currentStitchingPage = 1;
      this.pagedStitchingData = this.filteredStitchingData.slice(0, this.stitchingPageSize);

      console.log('📊 Paged Stitching Details Data:', this.pagedStitchingData);
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

  loadTailorData() {
    this.tailorService.getAllTailors().subscribe((data) => {
      console.log('✅ Raw Tailor Data:', data);
      this.tailorData = data;

      this.filteredTailorData = [...data];
      this.totalTailorPages = Math.ceil(this.filteredTailorData.length / this.tailorPageSize);
      this.currentTailorPage = 1;
      this.pagedTailorData = this.filteredTailorData.slice(0, this.tailorPageSize);

      console.log('📊 Paged Tailor Data:', this.pagedTailorData);
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

  loadDispatchData() {
    this.dispatchService.getAllDispatches().subscribe((data) => {
      console.log('✅ Raw Dispatch Data:', data);
      this.dispatchData = data;

      this.filteredDispatchData = [...data];
      this.totalDispatchPages = Math.ceil(this.filteredDispatchData.length / this.dispatchPageSize);
      this.currentDispatchPage = 1;
      this.pagedDispatchData = this.filteredDispatchData.slice(0, this.dispatchPageSize);

      console.log('📊 Paged Dispatch Data:', this.pagedDispatchData);
      this.renderDispatchDonutChart();
    });
  }

  filterDispatchByDate() {
    this.currentDispatchPage = 1;
    const fromDate = this.filterDispatchFromDate ? new Date(this.filterDispatchFromDate) : new Date('1970-01-01');
    const toDate = this.filterDispatchToDate ? new Date(this.filterDispatchToDate) : new Date();

    this.filteredDispatchData = this.dispatchData.filter(d => {
      const dispatchDate = new Date(d.Dispatch_Date);
      return dispatchDate >= fromDate && dispatchDate <= toDate;
    });

    this.applyDispatchSorting();
    this.updateDispatchPagination();
  }

  sortDispatchTable(column: string) {
    if (this.dispatchSortColumn === column) {
      this.dispatchSortDirection = this.dispatchSortDirection === 'asc' ? 'desc' : 'asc';
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

      if (['Dispatch_Id', 'Quantity_Dispatched', 'Price', 'Stitching_Details_Id'].includes(this.dispatchSortColumn)) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (['Dispatch_Date', 'Entry_Date', 'Modified_Date'].includes(this.dispatchSortColumn)) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return this.dispatchSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.dispatchSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updateDispatchPagination() {
    this.totalDispatchPages = Math.ceil(this.filteredDispatchData.length / this.dispatchPageSize);
    if (this.currentDispatchPage > this.totalDispatchPages) this.currentDispatchPage = this.totalDispatchPages || 1;

    const start = (this.currentDispatchPage - 1) * this.dispatchPageSize;
    this.pagedDispatchData = this.filteredDispatchData.slice(start, start + this.dispatchPageSize);

    console.log('Paged Dispatch Data:', this.pagedDispatchData);
  }

  goToDispatchPage(page: number) {
    if (page < 1 || page > this.totalDispatchPages) return;
    this.currentDispatchPage = page;
    this.updateDispatchPagination();
  }

  renderDispatchDonutChart() {
    if (this.donutChartDispatch) {
      this.donutChartDispatch.destroy();
    }

    // Aggregate quantity dispatched by material description
    const quantityMap = new Map<string, number>();
    this.filteredDispatchData.forEach(dispatch => {
      const material = dispatch.Material_Desc;
      const qty = dispatch.Quantity_Dispatched;
      const currentQty = quantityMap.get(material) ?? 0;
      quantityMap.set(material, currentQty + qty);
    });

    const labels = Array.from(quantityMap.keys());
    const quantities = labels.map(label => quantityMap.get(label) ?? 0);

    if (!this.donutChartDispatchRef) return;
    const canvas = this.donutChartDispatchRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChartDispatch = new Chart(ctx, {
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
          title: { display: true, text: 'Quantity Dispatched by Material' }
        }
      }
    });
  }

  selectReport(section: string) {
    this.selectedReportSection = section;

    if (section === 'dashboard') {
      this.loadDashboardData();
    } else if (section === 'material') {
      this.loadMaterialData();
    } else if (section === 'process') {
      this.loadMaterialProcessData();
    } else if (section === 'stitching') {
      this.loadStitchingDetailsData();
    } else if (section === 'tailor') {
      this.loadTailorData();
    } else if (section === 'dispatch') {
      this.loadDispatchData();
    }
  }

  openGenerateReport() {
    alert('Generate Report button clicked!');
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MaterialStockService } from '../../services/material-stock.service';
// import { MaterialStock } from '../../models/material-stock.model';

// @Component({
//   selector: 'app-material-stock',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './material-stock.component.html',
//   styleUrls: ['./material-stock.component.css']
// })
// export class MaterialStockComponent implements OnInit {
//   materials: any[] = [];
//   selectedMaterialId: number | null = null;
//   stocks: MaterialStock[] = [];

//   newStock: Partial<MaterialStock> = {
//     Material_Id: undefined,
//     Quantity: 0,
//     Color: '',
//     Pattern: '',
//     Price: 0,
//     Purchase_Date: ''
//   };

//   constructor(private stockService: MaterialStockService) {}

//   ngOnInit() {
//     this.loadMaterials();
//   }

//   loadMaterials() {
//     this.stockService.getMaterialDropdown().subscribe({
//       next: (data) => this.materials = data,
//       error: (err) => console.error('Failed to load materials', err)
//     });
//   }

//   onMaterialChange() {
//     if (this.selectedMaterialId !== null) {
//       this.stockService.getStocksByMaterialId(this.selectedMaterialId).subscribe({
//         next: (data) => this.stocks = data,
//         error: (err) => console.error('Failed to load stocks', err)
//       });
//     } else {
//       this.stocks = [];
//     }
//   }

//   addStock() {
//     if (!this.selectedMaterialId) {
//       alert('Select a material first');
//       return;
//     }

//     this.newStock.Material_Id = this.selectedMaterialId;

//     this.stockService.createStock(this.newStock as MaterialStock).subscribe({
//       next: () => {
//         this.newStock = {
//           Material_Id: undefined,
//           Quantity: 0,
//           Color: '',
//           Pattern: '',
//           Price: 0,
//           Purchase_Date: ''
//         };
//         this.onMaterialChange(); // Refresh stocks
//       },
//       error: (err) => console.error('Failed to add stock', err)
//     });
//   }
// }

import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { DxPivotGridModule, DxChartModule, DxPivotGridComponent, DxChartComponent } from 'devextreme-angular';

@Component({
  selector: 'app-analytics-pivot',
  standalone: true,
  imports: [CommonModule, DxPivotGridModule, DxChartModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-cube text-slate-400"></i> Phân tích Đa chiều (OLAP)
          </h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Kéo thả các trường dữ liệu để phân tích chuyên sâu chất lượng không khí (Trạm x Thời gian x Chỉ tiêu).</p>
        </div>
      </div>

      <div class="split-view" style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Chart Section -->
        <div class="card" style="background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; padding: 20px;">
          <h3 style="font-family: 'Outfit'; font-size: 16px; color: #e2e8f0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-chart-bar text-sky-400"></i> Biểu đồ trực quan hóa
          </h3>
          <dx-chart #chart id="sales-chart">
            <dxo-tooltip [enabled]="true" [customizeTooltip]="customizeTooltip"></dxo-tooltip>
            <dxo-adaptive-layout [width]="450"></dxo-adaptive-layout>
            <dxo-size [height]="320"></dxo-size>
            <dxo-common-series-settings type="bar"></dxo-common-series-settings>
            <dxo-legend verticalAlignment="top" horizontalAlignment="center"></dxo-legend>
          </dx-chart>
        </div>

        <!-- Pivot Grid Section -->
        <div class="card p-0" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid rgba(51, 65, 85, 0.5); background: rgba(15, 23, 42, 0.4);">
            <h3 style="font-family: 'Outfit'; font-size: 16px; color: #e2e8f0; margin: 0; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-table text-emerald-400"></i> Bảng dữ liệu Grid
            </h3>
          </div>
          <dx-pivot-grid
            #pivotGrid
            id="pivotgrid"
            [allowSortingBySummary]="true"
            [allowFiltering]="true"
            [showBorders]="false"
            [showColumnGrandTotals]="true"
            [showRowGrandTotals]="true"
            [showRowTotals]="false"
            [showColumnTotals]="false"
            [dataSource]="pivotDataSource"
            class="custom-pivot"
            style="height: 550px;"
          >
            <dxo-field-panel
                [showDataFields]="true"
                [showRowFields]="true"
                [showColumnFields]="true"
                [showFilterFields]="true"
                [allowFieldDragging]="true"
                [visible]="true">
            </dxo-field-panel>
            <dxo-field-chooser [enabled]="true" [allowSearch]="true"></dxo-field-chooser>
            <dxo-export [enabled]="true"></dxo-export>
            <dxo-scrolling mode="virtual"></dxo-scrolling>
          </dx-pivot-grid>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-pivot .dx-pivotgrid { color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
    ::ng-deep .custom-pivot .dx-pivotgrid-background { background-color: transparent !important; }
    ::ng-deep .custom-pivot .dx-area-data-cell { color: #cbd5e1 !important; border-bottom: 1px solid rgba(51,65,85,0.3) !important; border-right: 1px solid rgba(51,65,85,0.3) !important; }
    ::ng-deep .custom-pivot .dx-row-total.dx-area-data-cell { color: #38bdf8 !important; font-weight: 600; background: rgba(56,189,248,0.05) !important; }
    ::ng-deep .custom-pivot .dx-column-total.dx-area-data-cell { color: #22c55e !important; font-weight: 600; background: rgba(34,197,94,0.05) !important; }
    ::ng-deep .custom-pivot .dx-grandtotal { color: #f1f5f9 !important; font-weight: 700; background: rgba(15,23,42,0.6) !important; }
    
    ::ng-deep .custom-pivot .dx-pivotgrid-fields-area { background-color: rgba(15,23,42,.5) !important; }
    ::ng-deep .custom-pivot .dx-area-col-cell,
    ::ng-deep .custom-pivot .dx-area-row-cell { color: #94a3b8 !important; font-weight: 600; border-bottom: 1px solid rgba(51,65,85,0.4) !important; border-right: 1px solid rgba(51,65,85,0.4) !important; }
    ::ng-deep .custom-pivot .dx-area-col-cell { background: rgba(15, 23, 42, 0.4) !important; }
    ::ng-deep .custom-pivot .dx-area-row-cell { background: rgba(15, 23, 42, 0.2) !important; }
    
    ::ng-deep .custom-pivot .dx-pivotgrid-field-panel { background: rgba(15, 23, 42, 0.6) !important; border-bottom: 1px solid rgba(51,65,85,0.6) !important; }
    ::ng-deep .dx-pivotgrid-fields-area-header { color: #64748b !important; }
    
    ::ng-deep #sales-chart { background: transparent !important; }
    ::ng-deep .dx-chart-title { fill: #f1f5f9 !important; font-family: 'Outfit' !important; }
    ::ng-deep .dx-legend-item text { fill: #94a3b8 !important; }
    ::ng-deep .dx-axis-label text { fill: #64748b !important; }
    ::ng-deep .dx-axis-title text { fill: #94a3b8 !important; }
  `]
})
export class AnalyticsPivotComponent implements AfterViewInit {
  @ViewChild('pivotGrid', { static: false }) pivotGrid!: DxPivotGridComponent;
  @ViewChild('chart', { static: false }) chart!: DxChartComponent;

  pivotDataSource: any;

  constructor() {
    // Generate synthetic data for the pivot grid
    const rawData: any[] = [];
    const dateList = ["2025-06-10", "2025-06-11", "2025-06-12", "2025-06-13", "2025-06-14", "2025-06-15", "2025-06-16"];
    const targets = ["PM2.5", "PM10", "CO", "NO2", "SO2", "O3", "AQI"];

    MOCK_STATIONS.slice(0, 10).forEach(station => {
      dateList.forEach(date => {
        targets.forEach(target => {
          let val = target === 'CO' ? this.r(1, 15) : target === 'AQI' ? this.r(50, 200) : this.r(10, 150);
          rawData.push({
            trạm: station.name,
            quận: station.district,
            ngày: date,
            chỉ_tiêu: target,
            giá_trị: val
          });
        });
      });
    });

    this.pivotDataSource = {
      fields: [
        { dataField: "quận", area: "row", expanded: true },
        { dataField: "trạm", area: "row" },
        { dataField: "chỉ_tiêu", area: "column" },
        { dataField: "ngày", area: "column", groupName: "Ngày", expanded: true },
        { dataField: "giá_trị", area: "data", summaryType: "avg", format: { type: "fixedPoint", precision: 1 } }
      ],
      store: rawData
    };
  }

  ngAfterViewInit() {
    this.pivotGrid.instance.bindChart(this.chart.instance, {
      dataFieldsDisplayMode: 'splitPanes',
      alternateDataFields: false,
    });
  }

  customizeTooltip(args: any) {
    return {
      html: `<div style="padding:8px; border-radius:6px; background:#1e293b; color:#e2e8f0; border:1px solid #334155;">
               <b style="color:#38bdf8; display:block; margin-bottom:4px;">${args.seriesName}</b>
               ${args.argumentText}: <span style="color:#22c55e; font-weight:bold;">${args.valueText}</span>
             </div>`
    };
  }

  private r(min: number, max: number) { return Math.round(min + Math.random() * (max - min)); }
}

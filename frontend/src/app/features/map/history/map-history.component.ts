import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-page">
      <div class="map-header">
        <div>
          <h1><i class="fas fa-history"></i> Bản đồ Lịch sử AQI</h1>
          <p>Xem diễn biến không khí trong 24h qua với tính năng Time Lapse</p>
        </div>
      </div>
      <div class="map-wrapper">
        <div id="historyMap" class="map-container"></div>
        <div class="time-lapse-panel">
          <div class="tl-header">
            <h4>Thời gian: {{ currentDisplayTime }}</h4>
          </div>
          <div class="tl-controls">
            <button class="play-btn" (click)="togglePlay()">
              <i class="fas" [ngClass]="isPlaying ? 'fa-pause' : 'fa-play'"></i>
            </button>
            <input type="range" class="tl-slider" min="0" max="23" [(ngModel)]="currentHourIdx" (input)="onSliderChange()" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-page { height: calc(100vh - 120px); display: flex; flex-direction: column; }
    .map-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .map-header h1 { font-family: 'Outfit'; font-size: 22px; color: #f1f5f9; display: flex; align-items: center; gap: 10px; margin: 0 0 6px 0; }
    .map-header h1 i { color: #8b5cf6; }
    .map-header p { color: #94a3b8; font-size: 13px; margin: 0; }
    
    .map-wrapper { flex: 1; position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(51,65,85,0.4); }
    .map-container { width: 100%; height: 100%; background: #0f172a; }
    
    .time-lapse-panel {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(15,23,42,0.9); backdrop-filter: blur(10px); width: 400px;
      border: 1px solid rgba(139,92,246,0.4); border-radius: 12px; padding: 16px; z-index: 1000;
      color: #e2e8f0; display: flex; flex-direction: column; gap: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    }
    .tl-header { display: flex; justify-content: space-between; align-items: center; }
    .tl-header h4 { margin: 0; font-family: 'Outfit'; font-size: 15px; color: #f1f5f9; }
    .tl-controls { display: flex; align-items: center; gap: 12px; }
    .play-btn { background: #8b5cf6; border: none; width: 36px; height: 36px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .play-btn:hover { background: #7c3aed; transform: scale(1.05); }
    .tl-slider { flex: 1; accent-color: #8b5cf6; cursor: pointer; }
  `]
})
export class MapHistoryComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  private idwLayer: any = null;

  // Time lapse state
  currentHourIdx = 0;
  isPlaying = false;
  private playInterval: any;

  // Mock data: 24 arrays for 24 hours
  hourlyData: any[][] = [];
  currentDisplayTime = '';

  constructor() {
    this.generateMockHourlyData();
    this.updateDisplayTime();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    this.map?.remove();
    this.stopPlay();
  }

  generateMockHourlyData() {
    // Generate 24 hours of data for a few mock stations around Hanoi
    const baseStations = [
      { lat: 21.0285, lng: 105.8542 }, // Center
      { lat: 21.0400, lng: 105.8100 }, // West
      { lat: 21.0100, lng: 105.8800 }, // South East
      { lat: 20.9800, lng: 105.8300 }, // South
      { lat: 21.0600, lng: 105.8700 }  // North East
    ];

    for (let h = 0; h < 24; h++) {
      const frameData = baseStations.map(station => {
        // Create an AQI curve that peaks around hour 8-10 and 18-20
        let baseAqi = 50 + Math.random() * 50;
        if (h >= 7 && h <= 10) baseAqi += 80;
        if (h >= 17 && h <= 20) baseAqi += 100;

        // Add random fluctuation
        const aqi = Math.max(20, Math.min(300, baseAqi + (Math.random() - 0.5) * 40));
        return [station.lat, station.lng, aqi];
      });
      this.hourlyData.push(frameData);
    }
  }

  updateDisplayTime() {
    const d = new Date();
    d.setHours(d.getHours() - (23 - this.currentHourIdx));
    this.currentDisplayTime = d.toLocaleDateString('vi-VN') + ' ' + d.getHours().toString().padStart(2, '0') + ':00';
  }

  initMap() {
    this.map = L.map('historyMap', { zoomControl: false }).setView([21.0285, 105.8542], 11);
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB', maxZoom: 19
    }).addTo(this.map);

    this.renderLayer();
  }

  renderLayer() {
    if (!this.map) return;

    if (this.idwLayer) {
      this.map.removeLayer(this.idwLayer);
    }

    const dataObj = this.hourlyData[this.currentHourIdx];

    // @ts-ignore
    this.idwLayer = L.idwLayer(dataObj, {
      opacity: 0.6,
      maxZoom: 18,
      cellSize: 5,
      exp: 2,
      max: 300
    }).addTo(this.map);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      // Loop if at end
      if (this.currentHourIdx >= 23) {
        this.currentHourIdx = 0;
      }
      this.playInterval = setInterval(() => {
        if (this.currentHourIdx < 23) {
          this.currentHourIdx++;
          this.updateDisplayTime();
          this.renderLayer();
        } else {
          this.stopPlay();
        }
      }, 1000); // 1 second per frame
    } else {
      this.stopPlay();
    }
  }

  stopPlay() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
  }

  onSliderChange() {
    this.stopPlay();
    this.currentHourIdx = Number(this.currentHourIdx);
    this.updateDisplayTime();
    this.renderLayer();
  }
}
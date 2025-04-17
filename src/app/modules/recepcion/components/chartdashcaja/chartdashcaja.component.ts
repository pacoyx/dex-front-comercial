import { Component, effect, input, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { ChartType } from 'ng-apexcharts';

@Component({
  selector: 'app-chartdashcaja',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './chartdashcaja.component.html',
  styleUrl: './chartdashcaja.component.css'
})
export class ChartdashcajaComponent {
  @ViewChild("chart") chart!: ChartComponent;

  inputTitulo = input<string>("iniciando el titulo");
  inputValoresSeries = input<number[]>([1, 2, 3, 4, 5]);
  inputLabels = input<string[]>(["A", "B", "C", "D", "E"]);

  _title = {
    text: "titulo de prueba ",
  };
  _series = [44, 55, 13, 43, 22];

  _chart = {
    width: 380,
    type: "pie" as ChartType
  };

  _labels = ["Team A", "Team B", "Team C", "Team D", "Team E"];

  _dataLabels = {
    enabled: true,
    formatter: (val: number, opts: any) => {
      return `${opts.w.globals.series[opts.seriesIndex].toFixed(2)} (${val.toFixed(2)}%)`;
    },
    style: {
      fontSize: '14px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 'bold',
      colors: ['#fff']
    }
  };


  _responsive = [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: "bottom"
        }
      }
    }
  ]

  constructor() {

    effect(() => {
      this._title.text = this.inputTitulo();
      this._series = this.inputValoresSeries();
      this._labels = this.inputLabels();
    });
  }


}

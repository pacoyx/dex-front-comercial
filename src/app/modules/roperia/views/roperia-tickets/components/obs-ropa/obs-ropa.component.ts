import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-obs-ropa',
  standalone: true,
  imports: [NgClass],
  templateUrl: './obs-ropa.component.html',
  styleUrl: './obs-ropa.component.css'
})
export class ObsRopaComponent {
  obsEvent = output<string[]>();

  flagManchas = false;
  isNoButtonActive = true;
  isManchasButtonActive = false;
  isRoturaButtonActive = false;
  sectionsManchasSelected: { id: number }[] = [];
  sectionsRoturasSelected: { id: number }[] = [];


  itemsManchas: { id: number, isActive: boolean }[] = [];
  itemsRoturas: { id: number, isActive: boolean }[] = [];

  items: { id: number, isActive: boolean }[] = [
    { id: 1, isActive: false },
    { id: 2, isActive: false },
    { id: 3, isActive: false },
    { id: 4, isActive: false },
    { id: 5, isActive: false },
    { id: 6, isActive: false },
    { id: 7, isActive: false },
    { id: 8, isActive: false },
    { id: 9, isActive: false },
    { id: 10, isActive: false },
    { id: 11, isActive: false },
    { id: 12, isActive: false },
    { id: 13, isActive: false },
    { id: 14, isActive: false },
    { id: 15, isActive: false },
    { id: 16, isActive: false },
  ];

  getClassSection(i: number) {
    if (this.isNoButtonActive) {
      return '';
    }
    if (this.flagManchas) {
      return this.sectionsManchasSelected.some((x) => x.id === i) ? 'activeSection' : '';
    } else {
      return this.sectionsRoturasSelected.some((x) => x.id === i) ? 'activeSection' : '';
    }

  }

  toggleNoButton() {
    this.isNoButtonActive = true;
    this.isManchasButtonActive = false;
    this.isRoturaButtonActive = false;
    this.items.map((x) => x.isActive = false);

    this.itemsManchas = [];
    this.itemsRoturas = [];
    this.sectionsManchasSelected = [];
    this.sectionsRoturasSelected = [];
    let arrObs: string[] = [];
    this.obsEvent.emit(arrObs);
  }

  toggleManchasButton() {
    this.isManchasButtonActive = true;
    this.isNoButtonActive = false;
    this.isRoturaButtonActive = false;
    this.setFlagManchas();

    this.items.map((x) => x.isActive = false);
    this.itemsManchas.forEach(m => {
      const item = this.items.find(i => i.id === m.id);
      if (item) {
        item.isActive = true;
      }
    });

  }

  toggleRoturaButton() {
    this.isRoturaButtonActive = true;
    this.isNoButtonActive = false;
    this.isManchasButtonActive = false
    this.setFlagRoturas();

    this.items.map((x) => x.isActive = false);
    this.itemsRoturas.forEach(m => {
      const item = this.items.find(i => i.id === m.id);
      if (item) {
        item.isActive = true;
      }
    });
  }


  toggleItemState(itemId: number) {
    this.items = this.items.map(item =>
      item.id === itemId ? { ...item, isActive: !item.isActive } : item
    );
    this.saveIndexSection(itemId);
    // console.log('watch items ==>', this.items);
    if (this.flagManchas) {
      this.itemsManchas = this.items.filter((x) => x.isActive === true);
    } else {
      this.itemsRoturas = this.items.filter((x) => x.isActive === true);
    }
    // console.log('watch itemsManchas ==>', this.itemsManchas);
    // console.log('watch itemsRoturas ==>', this.itemsRoturas);


    let arrObs: string[] = [];
    arrObs.push(this.itemsManchas.map((x) => 'M' + x.id).join(','));
    arrObs.push(this.itemsRoturas.map((x) => 'R' + x.id).join(','));
    this.obsEvent.emit(arrObs);

  }


  saveIndexSection(i: number) {
    if (this.isNoButtonActive) {

    } else {
      if (this.flagManchas) {
        this.setDivManchas(i);
      } else {
        this.setDivRoturas(i);
      }
    }
  }

  setDivRoturas(i: number) {
    console.log(i);
    if (this.sectionsRoturasSelected.some((x) => x.id === i)) {
      this.sectionsRoturasSelected = this.sectionsRoturasSelected.filter((x) => x.id !== i);
    } else {
      this.sectionsRoturasSelected.push({ id: i });
    }
    console.log(this.sectionsRoturasSelected);
  }

  setDivManchas(i: number) {
    console.log(i);
    if (this.sectionsManchasSelected.some((x) => x.id === i)) {
      this.sectionsManchasSelected = this.sectionsManchasSelected.filter((x) => x.id !== i);
    } else {
      this.sectionsManchasSelected.push({ id: i });
    }
    console.log(this.sectionsManchasSelected);
  }

  setFlagManchas() {
    this.flagManchas = true;
  }

  setFlagRoturas() {
    this.flagManchas = false;
  }


}

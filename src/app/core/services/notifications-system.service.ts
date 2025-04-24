import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogNotificationsComponent } from '../components/dialog-notifications/dialog-notifications.component';


@Injectable({
  providedIn: 'root'
})
export class NotificationsSystemService {

  readonly dialog = inject(MatDialog);

  constructor(private snackBar: MatSnackBar) { }

  showErrorDialog(message: string, wordKey?: string): void {
    this.dialog.open(DialogNotificationsComponent, { data: { title: '', msg: message, err: true, wordKey, imprimir: false } });
  }

  showSuccessDialog(message: string, wordKey?: string, imprimir?: boolean): void {
    this.dialog.open(DialogNotificationsComponent, { data: { title: '', msg: message, err: false, wordKey, imprimir } })
      .afterClosed().subscribe((result) => {
        if (result === 'Imprimir')
          window.print();
      });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: 'polite',
      panelClass: ['red-snackbar'],
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: 'polite',
      panelClass: ['green-snackbar'],
    });
  }
}

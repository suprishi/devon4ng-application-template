import { Component, OnInit, ViewChild } from '@angular/core';
import { ITdDataTableColumn, TdDataTableComponent, TdDialogService, IPageChangeEvent, TdDataTableColumnComponent, ITdDataTableSortChangeEvent } from '@covalent/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { SampleDataDataGridService } from '../services/sampledata.service';
import { AuthService } from '../../core/security/auth.service';
import { SampleDataDialogComponent } from '../sampledata-dialog/sampledata-dialog.component';
import { Pagination } from '../../core/interfaces/pagination';


@Component({
    selector: 'app-sampledata-grid',
    templateUrl: './sampledata-grid.component.html',
    styleUrls: ['./sampledata-grid.component.scss']
}) export class SampleDataGridComponent implements OnInit {
    @ViewChild('dataTable') dataTable: TdDataTableComponent;
    data: any = [];
    columns: ITdDataTableColumn[] = [{
        name: 'name',
        label: this.getTranslation('sampledatamanagement.SampleData.columns.name')
    }, {
        name: 'surname',
        label: this.getTranslation('sampledatamanagement.SampleData.columns.surname')
    }, {
        name: 'age',
        label: this.getTranslation('sampledatamanagement.SampleData.columns.age')
    }, {
        name: 'mail',
        label: this.getTranslation('sampledatamanagement.SampleData.columns.mail')
    }];
    private pagination: Pagination = {
        size: 8,
        page: 1,
        total: 1
    };
    private sorting: any[] = [];
    pageSize = 8;
    pageSizes: number[] = [8, 16, 24];
    selectedRow: any;
    dialogRef: MatDialogRef < SampleDataDialogComponent > ;
    totalItems: number;
    searchTerms: any = {
        name: null,
        surname: null,
        age: null,
        mail: null
    };
    constructor(private translate: TranslateService,
                public dialog: MatDialog,
                public authService: AuthService,
                public router: Router,
                private dataGridService: SampleDataDataGridService,
                private _dialogService: TdDialogService) {}

    ngOnInit() {
        this.getSampleData();
    }
    getSampleData() {
        this.dataGridService.getSampleData(this.pageSize, this.pagination.page, this.searchTerms, this.sorting).subscribe((res: any) => {
            this.data = res.result;
            this.totalItems = res.pagination.total;
            this.dataTable.refresh();
        }, (error: any) => {
            setTimeout(() => {
                this._dialogService.openAlert({
                    message: error.message,
                    title: this.getTranslation('ERROR'),
                    closeButton: 'CLOSE'
                });
            });
        });
    }
    getTranslation(text: string): string {
        let value: string;
        this.translate.get(text).subscribe((res: string) => {
            value = res;
        });
        this.translate.onLangChange.subscribe(() => {
            this.columns.forEach(column => {
                if (text.endsWith(column.name)) {
                    this.translate.get('sampledatamanagement.SampleData.columns.' + column.name).subscribe((res: string) => {
                        column.label = res;
                    });
                }
            });
            this.dataTable.refresh();
        });
        return value;
    }
    page(pagingEvent: IPageChangeEvent): void {
        this.pagination = {
            size: pagingEvent.pageSize,
            page: pagingEvent.page,
            total: 1,
        };
        this.getSampleData();
    }
    sort(sortEvent: ITdDataTableSortChangeEvent): void {
        this.sorting = [];
        this.sorting.push({
            'name': sortEvent.name.split('.').pop(),
            'direction': '' + sortEvent.order
        });
        this.getSampleData();
    }
  openDialog(): void {
    this.dialogRef = this.dialog.open(SampleDataDialogComponent);

    this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.dataGridService.saveSampleData(result).subscribe(() => {
                this.getSampleData();
            }, (error) => {
                this._dialogService.openAlert({
                    message: JSON.parse(error.text()).message,
                    title: this.getTranslation('sampledatamanagement.alert.title')
                }).afterClosed().subscribe((accept: boolean) => {
                    if (accept) {
                        this.authService.setLogged(false);
                        this.router.navigate(['/login']);
                    }
                });
            });
        }
    });
  }
    selectEvent(e): void {
        e.selected ? this.selectedRow = e.row : this.selectedRow = undefined;
    }
    openEditDialog(): void {
        this.dialogRef = this.dialog.open(SampleDataDialogComponent, {
            data: this.selectedRow,
        });
        this.dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataGridService.saveSampleData(result).subscribe(() => {
                    this.getSampleData();
                }, (error) => {
                    this._dialogService.openAlert({
                        message: JSON.parse(error.text()).message,
                        title: this.getTranslation('sampledatamanagement.alert.title')
                    }).afterClosed().subscribe((accept: boolean) => {
                        if (accept) {
                            this.authService.setLogged(false);
                            this.router.navigate(['/login']);
                        }
                    });
                });
            }
        });
    }
    openConfirm(): void {
        this._dialogService.openConfirm({
            message: this.getTranslation('sampledatamanagement.alert.message'),
            title: this.getTranslation('sampledatamanagement.alert.title'),
            cancelButton: this.getTranslation('sampledatamanagement.alert.cancelBtn'),
            acceptButton: this.getTranslation('sampledatamanagement.alert.acceptBtn'),
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.dataGridService.deleteSampleData(this.selectedRow.id).subscribe(() => {
                    this.getSampleData();
                    this.selectedRow = undefined;
                }, (error) => {
                    this._dialogService.openAlert({
                        message: JSON.parse(error.text()).message,
                        title: this.getTranslation('sampledatamanagement.alert.title')
                    }).afterClosed().subscribe((acceptance: boolean) => {
                        if (acceptance) {
                            this.authService.setLogged(false);
                            this.router.navigate(['/login']);
                        }
                    });
                });
            }
        });
    }
  searchReset(form): void {
    form.reset();
    this.getSampleData();
  }
}
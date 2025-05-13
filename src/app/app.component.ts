import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { DadosService, ColunasConfig } from './services/dados.service';

interface SortMeta {
  field: string;
  order: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TableModule,
    MultiSelectModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    DragDropModule,
    DialogModule,
    TooltipModule,
    BlockUIModule,
    ProgressSpinnerModule,
    FormsModule
  ],
  providers: [DadosService],
  template: `
    <p-blockUI [blocked]="loading">
      <p-progressSpinner 
        class="block-spinner"
        strokeWidth="4"
        animationDuration=".5s"
      ></p-progressSpinner>
    </p-blockUI>

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-3">
        <h1>Tabela de Dados</h1>
        <div>
          <button pButton icon="pi pi-print" (click)="imprimirDadosAtuais()" class="p-button-rounded p-button-text mr-2" pTooltip="Imprimir dados atuais"></button>
          <button pButton icon="pi pi-cog" (click)="showConfigDialog = true" class="p-button-rounded p-button-text"></button>
          <button pButton icon="pi pi-refresh" (click)="resetarConfig()" class="p-button-rounded p-button-text"></button>
        </div>
      </div>
      
      <div class="flex gap-2 mb-3">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Buscar..." />
        </span>
      </div>

      <p-table
        #dt
        [value]="dados"
        [columns]="colunasVisiveis"
        [paginator]="true"
        [rows]="10"
        [globalFilterFields]="getCamposFiltro()"
        [tableStyle]="{ 'min-width': '50rem' }"
        [rowHover]="true"
        [loading]="loading"
        dataKey="id"
      >
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngFor="let col of columns" [pSortableColumn]="col.field">
              {{col.header}}
              <p-sortIcon [field]="col.field"></p-sortIcon>
            </th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns">
              <ng-container [ngSwitch]="col.tipo">
                <span *ngSwitchCase="'moeda'">
                  {{rowData[col.field] | currency:'BRL':'symbol':'1.2-2'}}
                </span>
                <span *ngSwitchCase="'data'">
                  {{rowData[col.field] | date:'dd/MM/yyyy'}}
                </span>
                <span *ngSwitchDefault>
                  {{rowData[col.field]}}
                </span>
              </ng-container>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog de Configuração -->
    <p-dialog 
      header="Configurar Colunas" 
      [(visible)]="showConfigDialog" 
      [style]="{width: '50vw'}"
      [modal]="true"
      [closable]="!loading"
      [closeOnEscape]="!loading"
    >
      <div class="grid">
        <div class="col-12">
          <p>Arraste as colunas para reordenar e marque/desmarque para mostrar/ocultar:</p>
        </div>
        <div class="col-12">
          <div class="drag-list">
            <div 
              *ngFor="let col of colunasConfig" 
              class="drag-item flex align-items-center gap-2 mb-2 p-2 border-round cursor-pointer"
              pDraggable="colunas"
              (onDragStart)="dragStart($event, col)"
              (onDragEnd)="dragEnd()"
              pDroppable="colunas"
              (onDrop)="drop($event, col)"
              [class.drag-highlight]="isDragging && draggedColumn?.ordem !== col.ordem"
            >
              <i class="pi pi-bars"></i>
              <div class="flex-grow-1">
                <label class="cursor-pointer">
                  <input type="checkbox" [(ngModel)]="col.visible" class="mr-2">
                  {{col.header}}
                </label>
              </div>
              <span class="ordem-badge">{{col.ordem}}</span>
            </div>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Salvar" (click)="salvarConfig()" class="p-button-success"></button>
        <button pButton label="Cancelar" (click)="showConfigDialog = false" class="p-button-text"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      position: relative;
    }
    .card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
    }
    .flex {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .justify-content-between {
      justify-content: space-between;
    }
    .cursor-pointer {
      cursor: pointer;
    }
    .drag-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .drag-item {
      background: #ffffff;
      border: 1px solid #dee2e6;
      transition: all 0.2s;
    }
    .drag-item:hover {
      background: #f8f9fa;
    }
    .drag-highlight {
      background: #e9ecef;
      border: 1px dashed #6366f1;
    }
    .ordem-badge {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }
    .grid {
      display: grid;
      gap: 1rem;
    }
    .col-12 {
      grid-column: span 12;
    }
    .flex-grow-1 {
      flex-grow: 1;
    }
    .block-spinner {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  dados: any[] = [];
  colunasConfig: ColunasConfig[] = [];
  colunasVisiveis: ColunasConfig[] = [];
  showConfigDialog = false;
  isDragging = false;
  draggedColumn: ColunasConfig | null = null;
  loading = true;

  constructor(private dadosService: DadosService) {
    console.log('AppComponent inicializado');
  }

  ngOnInit() {
    console.log('ngOnInit iniciado');
    this.carregarDados();
    this.carregarConfig();
  }

  carregarDados() {
    console.log('Iniciando carregamento de dados');
    this.loading = true;
    this.dadosService.getDados().subscribe({
      next: (dados) => {
        console.log('Dados carregados:', dados);
        this.dados = dados;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
        this.loading = false;
      }
    });
  }

  carregarConfig() {
    console.log('Iniciando carregamento de configuração');
    this.loading = true;
    this.dadosService.getColunasConfig().subscribe({
      next: (config) => {
        console.log('Configuração carregada:', config);
        this.colunasConfig = config;
        this.atualizarColunasVisiveis();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configuração:', error);
        this.loading = false;
      }
    });
  }

  getCamposFiltro(): string[] {
    return this.colunasVisiveis.map(col => col.field);
  }

  atualizarColunasVisiveis() {
    this.colunasVisiveis = this.colunasConfig
      .filter(col => col.visible)
      .sort((a, b) => a.ordem - b.ordem);
  }

  dragStart(event: DragEvent, coluna: ColunasConfig) {
    this.isDragging = true;
    this.draggedColumn = coluna;
  }

  dragEnd() {
    this.isDragging = false;
  }

  drop(event: DragEvent, coluna: ColunasConfig) {
    if (this.draggedColumn && this.draggedColumn !== coluna) {
      const draggedOrdem = this.draggedColumn.ordem;
      const dropOrdem = coluna.ordem;
      
      // Atualiza a ordem de todas as colunas afetadas
      this.colunasConfig = this.colunasConfig.map(col => {
        if (col === this.draggedColumn) {
          return { ...col, ordem: dropOrdem };
        } else if (draggedOrdem < dropOrdem && col.ordem <= dropOrdem && col.ordem > draggedOrdem) {
          return { ...col, ordem: col.ordem - 1 };
        } else if (draggedOrdem > dropOrdem && col.ordem >= dropOrdem && col.ordem < draggedOrdem) {
          return { ...col, ordem: col.ordem + 1 };
        }
        return col;
      });

      // Reordena o array baseado na nova ordem
      this.colunasConfig.sort((a, b) => a.ordem - b.ordem);
      
      // Atualiza as colunas visíveis
      this.atualizarColunasVisiveis();
    }
    this.draggedColumn = null;
    this.isDragging = false;
  }

  salvarConfig() {
    console.log('Salvando configuração:', this.colunasConfig);
    this.dadosService.salvarColunasConfig(this.colunasConfig).subscribe({
      next: () => {
        this.showConfigDialog = false;
        this.atualizarColunasVisiveis();
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
      }
    });
  }

  resetarConfig() {
    console.log('Resetando configuração...');
    this.dadosService.resetarColunasConfig().subscribe({
      next: (config) => {
        this.colunasConfig = config;
        this.atualizarColunasVisiveis();
      },
      error: (error) => {
        console.error('Erro ao resetar configuração:', error);
      }
    });
  }

  imprimirDadosAtuais() {
    // Obtém a referência da tabela
    const tabelaAtual = this.dt;
    
    // Obtém os dados já ordenados e filtrados da tabela
    let dadosFiltrados = [...(tabelaAtual.filteredValue || this.dados)];

    // Aplica a ordenação atual
    const multiSortMeta = tabelaAtual.multiSortMeta;
    if (multiSortMeta && multiSortMeta.length > 0) {
      // Ordenação múltipla
      dadosFiltrados.sort((a: any, b: any) => {
        return this.ordenarMultiplosCampos(a, b, multiSortMeta);
      });
    } else if (tabelaAtual.sortField) {
      // Ordenação simples
      const sortField = tabelaAtual.sortField;
      dadosFiltrados.sort((a: any, b: any) => {
        let valor1 = a[sortField];
        let valor2 = b[sortField];

        // Tratamento especial para diferentes tipos de dados
        const coluna = this.colunasConfig.find(col => col.field === sortField);
        if (coluna) {
          switch (coluna.tipo) {
            case 'data':
              valor1 = valor1 ? new Date(valor1).getTime() : 0;
              valor2 = valor2 ? new Date(valor2).getTime() : 0;
              break;
            case 'moeda':
              valor1 = typeof valor1 === 'number' ? valor1 : parseFloat(valor1?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
              valor2 = typeof valor2 === 'number' ? valor2 : parseFloat(valor2?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
              break;
          }
        }

        if (valor1 == null) return 1;
        if (valor2 == null) return -1;
        if (valor1 === valor2) return 0;
        
        let resultado = valor1 < valor2 ? -1 : 1;
        return tabelaAtual.sortOrder === 1 ? resultado : -resultado;
      });
    }
    
    // Cria um array para armazenar os dados formatados
    const dadosFormatados = [];
    
    // Adiciona o cabeçalho com as colunas visíveis
    const cabecalho = this.colunasVisiveis.map(col => col.header);
    dadosFormatados.push(cabecalho);
    
    // Para cada linha de dados
    dadosFiltrados.forEach((row: Record<string, any>) => {
      const linhaFormatada = this.colunasVisiveis.map(col => {
        const valor = row[col.field];
        
        // Formata o valor de acordo com o tipo da coluna
        switch (col.tipo) {
          case 'moeda':
            return new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(valor);
          case 'data':
            return valor ? new Date(valor).toLocaleDateString('pt-BR') : '';
          default:
            return valor?.toString() || '';
        }
      });
      dadosFormatados.push(linhaFormatada);
    });
    
    // Cria uma janela temporária para impressão
    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      console.error('Não foi possível abrir a janela de impressão');
      return;
    }
    
    // Cria o HTML da tabela
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dados da Tabela</title>
          <style>
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-bottom: 1rem;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f4f4f4; 
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            @media print {
              table { page-break-inside: auto }
              tr { page-break-inside: avoid; page-break-after: auto }
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${dadosFormatados[0].map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${dadosFormatados.slice(1).map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Escreve o HTML na janela de impressão
    janelaImpressao.document.write(html);
    janelaImpressao.document.close();
    
    // Imprime a janela
    setTimeout(() => {
      janelaImpressao.print();
      janelaImpressao.close();
    }, 250);
  }

  private ordenarMultiplosCampos(obj1: any, obj2: any, multiSortMeta: SortMeta[]): number {
    let valor1, valor2;
    let resultado: number = 0;

    for (let meta of multiSortMeta) {
      const coluna = this.colunasConfig.find(col => col.field === meta.field);
      valor1 = obj1[meta.field];
      valor2 = obj2[meta.field];

      // Tratamento especial para diferentes tipos de dados
      if (coluna) {
        switch (coluna.tipo) {
          case 'data':
            valor1 = valor1 ? new Date(valor1).getTime() : 0;
            valor2 = valor2 ? new Date(valor2).getTime() : 0;
            break;
          case 'moeda':
            valor1 = typeof valor1 === 'number' ? valor1 : parseFloat(valor1?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
            valor2 = typeof valor2 === 'number' ? valor2 : parseFloat(valor2?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
            break;
        }
      }

      if (valor1 == null) return 1;
      if (valor2 == null) return -1;
      if (valor1 === valor2) {
        resultado = 0;
        continue;
      }

      resultado = valor1 < valor2 ? -1 : 1;
      resultado = meta.order === 1 ? resultado : -resultado;

      if (resultado !== 0) break;
    }

    return resultado;
  }

  onGlobalFilter(event: any) {
    this.dt.filterGlobal(event.target.value, 'contains');
  }
}

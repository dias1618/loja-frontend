import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ColunasConfig {
  field: string;
  header: string;
  visible: boolean;
  ordem: number;
  tipo: 'texto' | 'numero' | 'data' | 'moeda';
  formato?: string;
}

interface CamposResponse {
  query: string;
  response: Array<{ column_name: string }>;
}

interface DadosResponse {
  query: string;
  response: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class DadosService {
  private readonly API_URL = `${environment.apiUrl}/ask`;
  
  constructor(private http: HttpClient) {
    console.log('DadosService inicializado');
  }

  getDados(): Observable<any[]> {
    console.log('Buscando dados dos produtos...');
    const body = {
      question: "Quais os valores da tabela produtos?"
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<DadosResponse>(this.API_URL, body, { headers }).pipe(
      tap(response => console.log('Resposta da API (dados):', response)),
      map(response => response.response),
      catchError(error => {
        console.error('Erro ao buscar dados:', error);
        return of([]);
      })
    );
  }

  getColunasConfig(): Observable<ColunasConfig[]> {
    console.log('Buscando configuração de colunas...');
    const body = {
      question: "Quais os campos da tabela de produto, tirando a chave primária?"
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<CamposResponse>(this.API_URL, body, { headers }).pipe(
      tap(response => console.log('Resposta da API:', response)),
      map(response => {
        return response.response.map((campo, index) => {
          const config: ColunasConfig = {
            field: campo.column_name,
            header: this.formatarHeader(campo.column_name),
            visible: true,
            ordem: index + 1,
            tipo: this.inferirTipoCampo(campo.column_name)
          };

          if (config.tipo === 'moeda') {
            config.formato = 'BRL';
          } else if (config.tipo === 'data') {
            config.formato = 'dd/MM/yyyy';
          }

          return config;
        });
      }),
      tap(colunas => console.log('Colunas configuradas:', colunas)),
      catchError(error => {
        console.error('Erro ao buscar colunas:', error);
        return of([]);
      })
    );
  }

  private formatarHeader(campo: string): string {
    return campo
      .split('_')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  private inferirTipoCampo(campo: string): 'texto' | 'numero' | 'data' | 'moeda' {
    if (campo === 'preco') {
      return 'moeda';
    } else if (campo === 'estoque') {
      return 'numero';
    } else if (campo.includes('_em') || campo.includes('data')) {
      return 'data';
    }
    return 'texto';
  }

  salvarColunasConfig(config: ColunasConfig[]): Observable<boolean> {
    console.log('Salvando configuração:', config);
    return of(true).pipe(delay(300));
  }

  resetarColunasConfig(): Observable<ColunasConfig[]> {
    console.log('Resetando configuração...');
    return this.getColunasConfig();
  }
} 
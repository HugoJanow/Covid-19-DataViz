import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const CovidDataTable = ({ data, loading, onRefresh }) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Configuration des colonnes
  const columns = useMemo(
    () => [
      {
        accessorKey: 'country',
        header: 'Pays',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">
              {row.getValue('country')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'total_cases',
        header: 'Cas Totaux',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '600',
              color: '#f5576c',
              display: 'inline-block'
            }}>
              {row.original.total_cases_formatted}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'total_deaths',
        header: 'Décès Totaux',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '600',
              color: '#8b5a3c',
              display: 'inline-block'
            }}>
              {row.original.total_deaths_formatted}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'cases_per_million',
        header: 'Cas / Million hab.',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '500',
              color: '#4facfe',
              display: 'inline-block'
            }}>
              {row.getValue('cases_per_million').toLocaleString('fr-FR')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'deaths_per_million',
        header: 'Décès / Million hab.',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '500',
              color: '#fd79a8',
              display: 'inline-block'
            }}>
              {row.getValue('deaths_per_million').toLocaleString('fr-FR')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'mortality_rate',
        header: 'Taux Mortalité (%)',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '500',
              color: '#ffa726',
              display: 'inline-block'
            }}>
              {row.getValue('mortality_rate')}%
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'new_cases',
        header: 'Nouveaux Cas',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '500',
              color: row.getValue('new_cases') > 0 ? '#0984e3' : 'rgba(255, 255, 255, 0.4)'
            }}>
              {row.original.new_cases_formatted}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'new_deaths',
        header: 'Nouveaux Décès',
        cell: ({ row }) => (
          <div className="text-right">
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: '500',
              color: row.getValue('new_deaths') > 0 ? '#e84393' : 'rgba(255, 255, 255, 0.4)'
            }}>
              {row.original.new_deaths_formatted}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: 'total_cases', desc: true }],
    },
  });

  if (loading) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-center space-x-2">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-white" />
          <span className="text-lg text-white">Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      overflow: 'hidden',
      background: 'transparent',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      {/* En-tête avec recherche et refresh */}
      <div style={{
        background: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem'
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              Tableau Récapitulatif COVID-19
            </h2>
            <p className="text-gray-300 text-sm">
              {table.getFilteredRowModel().rows.length} pays • Données en temps réel
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Barre de recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            
            {/* Bouton refresh */}
            <button
              onClick={onRefresh}
              style={{
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              title="Actualiser les données"
            >
              <ArrowPathIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ background: 'transparent' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getIsSorted() && (
                        <span className="flex-shrink-0">
                          {header.column.getIsSorted() === 'desc' ? (
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          ) : (
                            <ChevronUpIcon className="h-4 w-4 text-white" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id}
                style={{
                  background: 'transparent',
                  transition: 'background-color 0.15s ease',
                  borderTop: index === 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{
                  padding: '1rem 1.5rem',
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem'
                }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        background: 'transparent',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex items-center space-x-2">
          <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            ({table.getFilteredRowModel().rows.length} résultats au total)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            style={{
              fontSize: '0.875rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} / page
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{
                padding: '0.25rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                opacity: table.getCanPreviousPage() ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (table.getCanPreviousPage()) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{
                padding: '0.25rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                opacity: table.getCanNextPage() ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (table.getCanNextPage()) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistiques rapides */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.75rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Pays Affichés</span>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'var(--gradient-3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {table.getFilteredRowModel().rows.length}
            </div>
          </div>
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Cas Moyens/Million</span>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'var(--gradient-2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {Math.round(
                table.getFilteredRowModel().rows.reduce((sum, row) => 
                  sum + (row.original.cases_per_million || 0), 0
                ) / table.getFilteredRowModel().rows.length || 0
              ).toLocaleString('fr-FR')}
            </div>
          </div>
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Taux Mortalité Moyen</span>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'var(--gradient-5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {(
                table.getFilteredRowModel().rows.reduce((sum, row) => 
                  sum + (parseFloat(row.original.mortality_rate) || 0), 0
                ) / table.getFilteredRowModel().rows.length || 0
              ).toFixed(2)}%
            </div>
          </div>
          <div>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Page Actuelle</span>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'var(--gradient-1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CovidDataTable;
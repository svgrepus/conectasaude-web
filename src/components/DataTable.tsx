import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export interface Column {
  key: string;
  title: string;
  width?: string | number;
  render?: (value: any, item: any) => React.ReactNode;
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  searchQuery?: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  searchQuery = '',
  onEdit,
  onDelete,
  itemsPerPage = 10,
  emptyMessage = 'Nenhum registro encontrado'
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar dados baseado na pesquisa
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calcular paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Resetar página quando filtro mudar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map((column, index) => (
        <View 
          key={column.key} 
          style={[
            styles.headerCell,
            { flex: typeof column.width === 'number' ? column.width : 1 }
          ]}
        >
          <Text style={styles.headerText}>{column.title}</Text>
        </View>
      ))}
      {(onEdit || onDelete) && (
        <View style={[styles.headerCell, { flex: 1 }]}>
          <Text style={styles.headerText}>AÇÕES</Text>
        </View>
      )}
    </View>
  );

  const renderRow = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.dataRow, index % 2 === 1 && styles.evenRow]}>
      {columns.map((column) => (
        <View 
          key={column.key}
          style={[
            styles.dataCell,
            { flex: typeof column.width === 'number' ? column.width : 1 }
          ]}
        >
          <Text style={styles.dataText}>
            {column.render 
              ? column.render(item[column.key], item)
              : String(item[column.key] || '-')
            }
          </Text>
        </View>
      ))}
      {(onEdit || onDelete) && (
        <View style={[styles.dataCell, styles.actionsCell, { flex: 1 }]}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(item)}
            >
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={styles.actionText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Botão primeira página
    if (startPage > 1) {
      pageNumbers.push(
        <TouchableOpacity
          key="first"
          style={styles.pageButton}
          onPress={() => setCurrentPage(1)}
        >
          <Text style={styles.pageText}>1</Text>
        </TouchableOpacity>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <Text key="dots1" style={styles.pageText}>...</Text>
        );
      }
    }

    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton
          ]}
          onPress={() => setCurrentPage(i)}
        >
          <Text style={[
            styles.pageText,
            currentPage === i && styles.activePageText
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Botão última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <Text key="dots2" style={styles.pageText}>...</Text>
        );
      }
      pageNumbers.push(
        <TouchableOpacity
          key="last"
          style={styles.pageButton}
          onPress={() => setCurrentPage(totalPages)}
        >
          <Text style={styles.pageText}>{totalPages}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : theme.colors.jambeiro.green} />
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {pageNumbers}
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : theme.colors.jambeiro.green} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabela */}
      <View style={styles.tableContainer}>
        {renderHeader()}
        {currentData.length > 0 ? (
          <FlatList
            data={currentData}
            renderItem={renderRow}
            keyExtractor={(item, index) => `${item.id || index}`}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        )}
      </View>

      {/* Paginação */}
      {renderPagination()}

      {/* Info da paginação */}
      {filteredData.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.jambeiro.green,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  dataCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  editButton: {
    backgroundColor: theme.colors.jambeiro.green,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activePageButton: {
    backgroundColor: theme.colors.jambeiro.green,
    borderColor: theme.colors.jambeiro.green,
  },
  pageText: {
    fontSize: 14,
    color: '#495057',
  },
  activePageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});

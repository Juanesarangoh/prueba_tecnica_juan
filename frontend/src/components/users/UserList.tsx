
 // Muestra la lista de usuarios y maneja las operaciones CRUD
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  styled,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { userService } from '../../services/userService';
import { UserForm } from './UserForm';
import { User } from '../../types/User';

// Estilos comunes
const commonStyles = {
  borderRadius: {
    borderRadius: 4,
  },
  softShadow: {
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
  },
  errorColor: '#f44336',
  primaryBlue: '#0a2896',
};

// Componentes estilizados con Material UI
const StyledComponents = {
  TableContainer: styled(TableContainer)({
    ...commonStyles.borderRadius,
    ...commonStyles.softShadow,
    marginBottom: 16,
  }),

  Paper: styled(Paper)({
    ...commonStyles.borderRadius,
    ...commonStyles.softShadow,
  }),

  Table: styled(Table)({
    minWidth: 650,
    tableLayout: 'fixed',
    '& .MuiTableCell-root': {
      paddingTop: 9.6,
      paddingBottom: 9.6,
      fontSize: '0.875rem',
      borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
      fontWeight: 600,
      color: 'rgba(0, 0, 0, 0.87)',
    },
  }),

  TableRow: styled(TableRow)({
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }),

  DeleteIcon: styled(DeleteIcon)({
    fontSize: '1.1rem',
  }),

  CircularProgress: styled(CircularProgress)({
    width: 20,
    height: 20,
    color: commonStyles.errorColor,
  }),

  DialogSpinner: styled(CircularProgress)({
    width: 20,
    height: 20,
    color: 'white',
    marginRight: 8,
  }),
};

export const UserList = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{tipoDocumento: string, numeroDocumento: string} | null>(null);
  
  // Query para consultar usuarios
  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    error: queryError 
  } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: userService.getUsers
  });
  
  // Mutation para crear usuario
  const createMutation = useMutation<User, Error, Omit<User & { password: string }, 'id'>>({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsFormOpen(false);
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    }
  });
  
  // Mutation para eliminar usuario
  const deleteMutation = useMutation<void, Error, { tipoDocumento: string, numeroDocumento: string }>({
    mutationFn: ({ tipoDocumento, numeroDocumento }) =>
      userService.deleteUser(tipoDocumento, numeroDocumento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    }
  });
  
  
  const truncateText = (text: string | undefined | null, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };
  
  // Manejadores de eventos
  const handleCreateUser = async (userData: Omit<User & { password: string }, 'id'>) => {
    try {
      await createMutation.mutateAsync(userData);
    } catch (error: any) {

      if (!error.fieldErrors) {
        setErrorMessage(error.message);
      }
      // Re-lanzar el error para que pueda ser manejado por el formulario
      throw error;
    }
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenDeleteDialog = (tipoDocumento: string, numeroDocumento: string) => {
    setUserToDelete({ tipoDocumento, numeroDocumento });
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteMutation.mutateAsync(userToDelete);
      setDeleteDialogOpen(false);
    }
  };
  
  if (isLoadingUsers) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Calcular índices para la paginación
  const startIndex = page * rowsPerPage;
  const displayedUsers = users.slice(startIndex, startIndex + rowsPerPage);
  
  const columnWidths = {
    id: '2.5%',
    name: '4.5%',
    documentType: '4.5%',
    documentNumber: '4.5%',
    phone: '4.5%',
    agreement: '4.5%',
    coordinator: '4.5%',
    actions: '20%'
  };
  
  return (
    <Box sx={{ width: '100%', padding: '1.5rem' }}>
      {/* Notificación de error */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={() => setErrorMessage(null)}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Error de consulta */}
      {queryError && (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {queryError.message}
        </Alert>
      )}
      
      {/* Botón para crear nuevo usuario */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setIsFormOpen(true)}
          startIcon={<AddCircleIcon />}
          disabled={createMutation.isPending}
          sx={{
            backgroundColor: commonStyles.primaryBlue,
            textTransform: 'none',
            borderRadius: 1,
            fontWeight: 500,
            paddingLeft: 2,
            paddingRight: 2,
            '&:hover': {
              backgroundColor: commonStyles.primaryBlue,
            },
          }}
        >
          {createMutation.isPending ? 'Creando...' : 'Nuevo Usuario'}
        </Button>
      </Box>
      
      {/* Tabla de usuarios */}
      <StyledComponents.TableContainer>
        <StyledComponents.Paper>
          <StyledComponents.Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: columnWidths.id }}>ID</TableCell>
                <TableCell style={{ width: columnWidths.name }}>Nombres</TableCell>
                <TableCell style={{ width: columnWidths.name }}>Apellidos</TableCell>
                <TableCell style={{ width: columnWidths.documentType }}>Tipo de documento</TableCell>
                <TableCell style={{ width: columnWidths.documentNumber }}>Número de documento</TableCell>
                <TableCell style={{ width: columnWidths.phone }}>Celular</TableCell>
                <TableCell style={{ width: columnWidths.agreement }}>Convenio</TableCell>
                <TableCell style={{ width: columnWidths.coordinator }}>Coordinador</TableCell>
                <TableCell 
                  align="right" 
                  style={{ width: columnWidths.actions }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedUsers.map((user: User) => (
                <StyledComponents.TableRow key={user.numeroDocumento}>
                  <TableCell>{typeof user.id === 'number' ? user.id : 'N/A'}</TableCell>
                  <TableCell title={user.nombres}>
                    {truncateText(user.nombres, 15)}
                  </TableCell>
                  <TableCell title={user.apellidos}>
                    {truncateText(user.apellidos, 15)}
                  </TableCell>
                  <TableCell>{user.tipoDocumento}</TableCell>
                  <TableCell>{user.numeroDocumento}</TableCell>
                  <TableCell>{user.celular || ''}</TableCell>
                  <TableCell title={user.convenio || ''}>
                    {truncateText(user.convenio, 12)}
                  </TableCell>
                  <TableCell title={user.coordinador || ''}>
                    {truncateText(user.coordinador, 15)}
                  </TableCell>
                  <TableCell align="right">
                    {deleteMutation.isPending && deleteMutation.variables?.numeroDocumento === user.numeroDocumento ? (
                      <StyledComponents.CircularProgress size={20} />
                    ) : (
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(user.tipoDocumento, user.numeroDocumento)}
                        color="error"
                        size="small"
                        disabled={deleteMutation.isPending}
                        sx={{
                          padding: 0.25,
                          '&:hover': {
                            backgroundColor: `${commonStyles.errorColor}10`,
                          },
                        }}
                      >
                        <StyledComponents.DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </StyledComponents.TableRow>
              ))}
            </TableBody>
          </StyledComponents.Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Usuarios por página"
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select, & .MuiTablePagination-displayedRows': {
                marginBottom: 0,
                marginTop: 0,
              },
              '& .MuiTablePagination-select': {
                paddingTop: 0,
                paddingBottom: 0,
                height: '1.5rem',
              },
              '& .MuiInputBase-root': {
                marginRight: '8px',
                marginLeft: '8px',
              },
            }}
          />
        </StyledComponents.Paper>
      </StyledComponents.TableContainer>
      
      {/* Formulario de creación de usuario */}
      <UserForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={createMutation.isPending}
      />
      
      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog
        open={deleteDialogOpen}
        onClose={deleteMutation.isPending ? undefined : handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar usuario?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción eliminará permanentemente el usuario. 
            ¿Está seguro de que desea continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="primary"
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={deleteMutation.isPending}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {deleteMutation.isPending && (
              <StyledComponents.DialogSpinner size={20} />
            )}
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
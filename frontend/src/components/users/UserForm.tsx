import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  InputAdornment,
  SelectChangeEvent,
  Typography,
  CircularProgress,
  Box,
  OutlinedInput,
  styled,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Close, 
  PersonOutline,
  KeyboardDoubleArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from '@mui/icons-material';
import { User } from '../../types/User';

// Estilos comunes para reutilizar en los componentes
const commonStyles = {
  inputField: {
    backgroundColor: '#f9f9f9',
    borderRadius: 2,
    height: '38px',
  },
  inputText: {
    padding: '8px 10px',
    fontSize: '0.8rem',
    height: '22px',
  },
  placeholder: {
    color: '#999',
    opacity: 1,
  }
};

// Componentes estilizados con Material UI
const FormContainer = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: 550,
    width: '100%',
    margin: 16,
    minHeight: 'auto',
    height: 'auto',
    maxHeight: '90vh',
    padding: 0,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  }
});

const StyledElements = {
  FormHeader: styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 45,
    position: 'relative',
  }),
  
  FormTitle: styled(Typography)({
    width: '100%',
    marginBottom: 16,
    position: 'absolute',
    top: 16,
    fontSize: '1rem',
    fontWeight: 700,
    textAlign: 'center',
  }),
  
  Avatar: styled(Box)({
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    '& .MuiSvgIcon-root': {
      fontSize: 32,
      color: '#ffffff',
    }
  }),
  
  FormContent: styled(Box)({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: 20,
    rowGap: 5,
    padding: '5px 24px 20px',
    minHeight: 'auto',
    flex: '1 1 auto',
    overflowY: 'auto',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  }),
  
  FormField: styled(Box)({
    marginBottom: 12,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  }),
  
  FieldLabel: styled(Typography)({
    display: 'block',
    fontWeight: 600,
    marginBottom: 4,
    fontSize: '0.75rem',
    color: '#000000',
  }),
  
  FormActions: styled(Box)({
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '15px 20px',
    gap: 10,
    borderTop: '1px solid #eaeaea',
    marginTop: '0',
    backgroundColor: 'white',
    flex: '0 0 auto',
    position: 'sticky',
    bottom: 0,
    width: '100%',
    boxSizing: 'border-box',
  }),
  
  SubmitButton: styled(Button)({
    backgroundColor: '#0a2896',
    boxShadow: 'none',
    textTransform: 'none',
    padding: '6px 16px',
    fontSize: '0.85rem',
    minWidth: 70,
    height: 34,
    '&:hover': {
      backgroundColor: '#081d75',
    }
  }),
  
  CancelButton: styled(Button)({
    color: '#333',
    backgroundColor: '#fff',
    border: '1px solidrgb(0, 38, 255)',
    textTransform: 'none',
    boxShadow: 'none',
    fontSize: '0.85rem',
    padding: '6px 10px',
    height: 34,
  }),
  
  CloseButton: styled(IconButton)({
    position: 'absolute',
    right: 15,
    top: 14,
    color: '#999',
    padding: 2,
    zIndex: 100,
    margin: 0,
    width: 28,
    height: 28,
    minWidth: 'unset',
    minHeight: 'unset',
    backgroundColor: 'transparent',
    '& .MuiSvgIcon-root': {
      fontSize: 20,
      display: 'block',
    }
  }),
  
  FormColumn: styled(Box)({
    display: 'flex',
    flexDirection: 'column',
  }),
};

const RoleSelectorContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: '12px',
  width: '100%',
  marginBottom: '20px',
});

const RoleList = styled(Box)({
  border: '0px solid #e9ecef',
  borderRadius: '8px',
  backgroundColor: '#fff',
  overflowY: 'auto',
  height: '150px',
  padding: '0px',
});

const RoleButtonsContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '8px',
});

const RoleButton = styled(Button)({
  minWidth: '40px',
  padding: '5px',
  borderRadius: '5px',
  backgroundColor: '#fff',
  color: '#333',
  border: '1px solid #ced4da',
  '&:hover': {
    backgroundColor: '#e9ecef',
  },
  '&:disabled': {
    color: '#adb5bd',
    borderColor: '#e9ecef',
  }
});

const RoleItem = styled(ListItem)({
  padding: '4px 8px',
  '&:hover': {
    backgroundColor: '#e9ecef',
    cursor: 'pointer',
  },
});

// Componente para seleccionar uno o variois roles
const RoleSelector = ({ 
  availableRoles, 
  selectedRoles, 
  onRolesChange 
}: {
  availableRoles: string[],
  selectedRoles: string[],
  onRolesChange: (newSelectedRoles: string[]) => void
}) => {
  // Estado para mantener roles seleccionados en cada lista
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  
  // Determinar qué roles están disponibles
  const unassignedRoles = availableRoles.filter(role => !selectedRoles.includes(role));

  // Función para manejar la selección en la lista izquierda
  const handleLeftSelect = (role: string) => {
    if (leftSelected.includes(role)) {
      setLeftSelected(leftSelected.filter(r => r !== role));
    } else {
      setLeftSelected([...leftSelected, role]);
    }
  };
  
  // Función para manejar la selección en la lista derecha
  const handleRightSelect = (role: string) => {
    if (rightSelected.includes(role)) {
      setRightSelected(rightSelected.filter(r => r !== role));
    } else {
      setRightSelected([...rightSelected, role]);
    }
  };
  
  // Función para mover roles de izquierda a derecha.
  const moveToRight = () => {
    const newSelectedRoles = [...selectedRoles, ...leftSelected];
    onRolesChange(newSelectedRoles);
    setLeftSelected([]);
  };
  
  // Función para mover roles de derecha a izquierda
  const moveToLeft = () => {
    const newSelectedRoles = selectedRoles.filter(role => !rightSelected.includes(role));
    onRolesChange(newSelectedRoles);
    setRightSelected([]);
  };
  
  // Función para mover todos los roles a la derecha
  const moveAllToRight = () => {
    onRolesChange([...availableRoles]);
    setLeftSelected([]);
  };
  
  // Función para mover todos los roles a la izquierda (limpiar selección)
  const moveAllToLeft = () => {
    onRolesChange([]);
    setRightSelected([]);
  };
  
  return (
    <RoleSelectorContainer>
      <RoleList>
        <List disablePadding>
          {unassignedRoles.map(role => (
            <RoleItem 
              key={`left-${role}`}
              selected={leftSelected.includes(role)}
              onClick={() => handleLeftSelect(role)}
              dense
            >
              <ListItemIcon>
                <Checkbox 
                  edge="start"
                  checked={leftSelected.includes(role)}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                />
              </ListItemIcon>
              <ListItemText 
                primary={role.charAt(0).toUpperCase() + role.slice(1)}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </RoleItem>
          ))}
        </List>
      </RoleList>
      
      {/* Botones para mover roles */}
      <RoleButtonsContainer>
        <RoleButton 
          onClick={moveAllToRight}
          disabled={unassignedRoles.length === 0}
          title="Mover todos a la derecha"
        >
          <KeyboardDoubleArrowRight fontSize="small" />
        </RoleButton>
        <RoleButton 
          onClick={moveToRight}
          disabled={leftSelected.length === 0}
          title="Mover seleccionados a la derecha"
        >
          <KeyboardArrowRight fontSize="small" />
        </RoleButton>
        <RoleButton 
          onClick={moveToLeft}
          disabled={rightSelected.length === 0}
          title="Mover seleccionados a la izquierda"
        >
          <KeyboardArrowLeft fontSize="small" />
        </RoleButton>
        <RoleButton 
          onClick={moveAllToLeft}
          disabled={selectedRoles.length === 0}
          title="Mover todos a la izquierda"
        >
          <KeyboardDoubleArrowLeft fontSize="small" />
        </RoleButton>
      </RoleButtonsContainer>
      
      {/* Lista de roles asignados*/}
      <RoleList>
        <List disablePadding>
          {selectedRoles.map(role => (
            <RoleItem 
              key={`right-${role}`}
              selected={rightSelected.includes(role)}
              onClick={() => handleRightSelect(role)}
              dense
            >
              <ListItemIcon>
                <Checkbox 
                  edge="start"
                  checked={rightSelected.includes(role)}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                />
              </ListItemIcon>
              <ListItemText 
                primary={role.charAt(0).toUpperCase() + role.slice(1)}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </RoleItem>
          ))}
        </List>
      </RoleList>
    </RoleSelectorContainer>
  );
};

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User & { password: string; roles: string[] }, 'id'>) => void;
  isSubmitting?: boolean;
}

interface ValidationErrors {
  nombres?: string;
  apellidos?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  celular?: string;
  convenio?: string;
  coordinador?: string;
  password?: string;
  centroCostos?: string;
  documentoAliado?: string;
  nombreAliado?: string;
  general?: string;
}

export const UserForm = ({ open, onClose, onSubmit, isSubmitting = false }: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Estado inicial del formulario
  const initialFormState = useMemo(() => ({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    celular: '',
    convenio: '',
    coordinador: '',
    password: '',
    centroCostos: '',
    documentoAliado: '',
    nombreAliado: '',
    roles: [] as string[]
  }), []);
  
  const [formData, setFormData] = useState(initialFormState);
  
  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData(initialFormState);
      setShowPassword(false);
      setValidationErrors({});
    }
  }, [open, initialFormState]);

  // Manejadores de eventos
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({...prev, [name]: value}));
    
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({...prev, [name]: undefined}));
    }
  };
  
  const handleCelNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const truncatedValue = value.replace(/\D/g, '').slice(0, 10);
    event.target.value = truncatedValue;
    setFormData(prev => ({...prev, [name]: truncatedValue}));
    
    if (validationErrors.celular) {
      setValidationErrors(prev => ({...prev, celular: undefined}));
    }
  };
  
  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setFormData(prev => ({...prev, [name]: value as string}));
    
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({...prev, [name]: undefined}));
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setValidationErrors({});

    let hasErrors = false;
    const newErrors: ValidationErrors = {};
    
    // Validar campos obligatorios
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
      hasErrors = true;
    }
    
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
      hasErrors = true;
    }
    
    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = 'El tipo de documento es requerido';
      hasErrors = true;
    }
    
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
      hasErrors = true;
    }
    
    if (formData.celular.trim() && !/^\d{10}$/.test(formData.celular.trim())) {
      newErrors.celular = 'El número de celular debe tener 10 dígitos numéricos';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }
    
    const trimmedFormData = {
      ...formData,
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      numeroDocumento: formData.numeroDocumento.trim(),
      celular: formData.celular.trim(),
      password: formData.password.trim(),
      centroCostos: formData.centroCostos.trim(),
      documentoAliado: formData.documentoAliado.trim(),
      nombreAliado: formData.nombreAliado.trim(),
    };
    
    try {
      await onSubmit(trimmedFormData);
    } catch (error: any) {
      // Capturar errores de validación del backend
      console.error('Error en envío de formulario:', error);
      
      if (error.fieldErrors) {
        setValidationErrors(error.fieldErrors);
      } else {
        setValidationErrors({ general: error.message });
      }
    }
  };

  // Lista de todos los roles disponibles
  const allAvailableRoles = ['acreedor', 'aprobador', 'coordinador', 'conductor'];

  const SelectField = ({ 
    name, 
    value, 
    label, 
    required = false, 
    placeholder, 
    options 
  }: { 
    name: string; 
    value: string; 
    label: string; 
    required?: boolean; 
    placeholder: string; 
    options: { value: string; label: string }[] 
  }) => (
    <StyledElements.FormField>
      <StyledElements.FieldLabel>{label}</StyledElements.FieldLabel>
      <FormControl fullWidth required={required} size="small">
        <Select
          name={name}
          value={value}
          onChange={handleSelectChange}
          displayEmpty
          input={<OutlinedInput sx={commonStyles.inputField} />}
          renderValue={(selected) => {
            if (!selected) return <span style={{ color: '#999' }}>{placeholder}</span>;
            if (name === 'tipoDocumento') {
              return (selected as string) === "CC" ? "Cédula de Ciudadanía" : 
                    (selected as string) === "CE" ? "Cédula de Extranjería" : "Pasaporte";
            }
            return selected as string;
          }}
          IconComponent={props => (
            <svg
              className="MuiSvgIcon-root MuiSelect-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              {...props}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
          sx={{
            '& .MuiSelect-select': {
              padding: '8px 10px',
              backgroundColor: '#f9f9f9',
              fontSize: '0.8rem',
              color: value ? '#000' : '#999',
            },
            '& .MuiSelect-select.Mui-focused': {
              backgroundColor: '#f9f9f9',
            },
            '& .MuiSelect-icon': {
              color: '#777',
              right: '7px',
            }
          }}
        >
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledElements.FormField>
  );

  const renderTextField = (
    name: keyof ValidationErrors, 
    label: string, 
    placeholder: string, 
    required: boolean = false,
    onChange = handleTextChange,
    type: string = 'text',
    inputProps?: any
  ) => (
    <StyledElements.FormField>
      <StyledElements.FieldLabel>{label}</StyledElements.FieldLabel>
      <TextField
        required={required}
        fullWidth
        name={name}
        placeholder={placeholder}
        value={formData[name as keyof typeof formData] as string}
        onChange={onChange}
        variant="outlined"
        hiddenLabel
        size="small"
        type={type}
        error={!!validationErrors[name]}
        helperText={validationErrors[name]}
        InputProps={inputProps}
        sx={{
          '& .MuiInputBase-root': commonStyles.inputField,
          '& .MuiInputBase-input': commonStyles.inputText,
          '& .MuiInputBase-input::placeholder': commonStyles.placeholder,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: validationErrors[name] ? '#f44336' : '#e0e0e0',
          },
          '& .Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f44336',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: validationErrors[name] ? '#f44336' : '#0a2896',
            borderWidth: 1,
          },
          '& .MuiFormHelperText-root': {
            margin: 0,
            fontSize: '0.7rem',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }
        }}
      />
    </StyledElements.FormField>
  );

  return (
    <FormContainer 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <StyledElements.CloseButton
        aria-label="close"
        onClick={onClose}
        disableRipple
      >
        <Close />
      </StyledElements.CloseButton>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        minHeight: '200px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <StyledElements.FormHeader>
          <StyledElements.FormTitle>Crear usuario</StyledElements.FormTitle>
          <StyledElements.Avatar>
            <PersonOutline />
          </StyledElements.Avatar>
        </StyledElements.FormHeader>
        
        {validationErrors.general && (
          <Box sx={{ 
            backgroundColor: '#ffebee', 
            padding: '8px 16px', 
            marginBottom: '8px',
            color: '#d32f2f',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {validationErrors.general}
          </Box>
        )}
        
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden'
        }}>
          <StyledElements.FormContent>
            {/* Primera columna */}
            <StyledElements.FormColumn>
              {renderTextField('nombres', 'Nombres', 'Nombres', true)}
              
              <StyledElements.FormField>
                <StyledElements.FieldLabel>Tipo de documento</StyledElements.FieldLabel>
                <FormControl 
                  fullWidth 
                  required 
                  size="small"
                  error={!!validationErrors.tipoDocumento}
                >
                  <Select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleSelectChange}
                    displayEmpty
                    input={<OutlinedInput sx={{
                      ...commonStyles.inputField,
                      borderColor: validationErrors.tipoDocumento ? '#f44336' : undefined,
                    }} />}
                    renderValue={(selected) => {
                      if (!selected) return <span style={{ color: '#999' }}>Tipo de documento</span>;
                      return (selected as string) === "CC" ? "Cédula de Ciudadanía" : 
                             (selected as string) === "CE" ? "Cédula de Extranjería" : "Pasaporte";
                    }}
                    IconComponent={props => (
                      <svg
                        className="MuiSvgIcon-root MuiSelect-icon"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        {...props}
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    )}
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '8px 10px',
                        backgroundColor: '#f9f9f9',
                        fontSize: '0.8rem',
                        color: formData.tipoDocumento ? '#000' : '#999',
                      },
                      '& .MuiSelect-select.Mui-focused': {
                        backgroundColor: '#f9f9f9',
                      },
                      '& .MuiSelect-icon': {
                        color: '#777',
                        right: '7px',
                      }
                    }}
                  >
                    <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
                    <MenuItem value="CE">Cédula de Extranjería</MenuItem>
                    <MenuItem value="PA">Pasaporte</MenuItem>
                  </Select>
                  {validationErrors.tipoDocumento && (
                    <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                      {validationErrors.tipoDocumento}
                    </Typography>
                  )}
                </FormControl>
              </StyledElements.FormField>
          
              {renderTextField('celular', 'Celular', 'Celular', false, handleCelNumberChange)}
              
              <SelectField
                name="coordinador"
                value={formData.coordinador}
                label="Coordinadores"
                placeholder="Coordinadores"
                options={[
                  { value: "coordinador1", label: "Coordinador 1" },
                  { value: "coordinador2", label: "Coordinador 2" }
                ]}
              />
              
              {renderTextField('centroCostos', 'Centro de Costos', 'Centro de Costos')}
              {renderTextField('nombreAliado', 'Nombre Aliado', 'Nombre Aliado')}
            </StyledElements.FormColumn>
            
            {/* Segunda columna */}
            <StyledElements.FormColumn>
              {renderTextField('apellidos', 'Apellidos', 'Apellidos', true)}
              {renderTextField('numeroDocumento', 'Número de documento', 'Número de documento', true)}
              
              <SelectField
                name="convenio"
                value={formData.convenio}
                label="Convenio"
                placeholder="Convenio"
                options={[
                  { value: "convenio1", label: "Convenio 1" },
                  { value: "convenio2", label: "Convenio 2" }
                ]}
              />
              
              {renderTextField('password', 'Contraseña', 'Contraseña', false, handleTextChange, 
                showPassword ? 'text' : 'password',
                {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ 
                          padding: '5px',
                          marginLeft: 0,
                          height: 34
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              )}
              
              {renderTextField('documentoAliado', 'Documento Aliado', 'Documento Aliado')}
            </StyledElements.FormColumn>
            
            <Box gridColumn="span 2" mt={2} mb={1}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Roles
              </Typography>
              <RoleSelector 
                availableRoles={allAvailableRoles}
                selectedRoles={formData.roles}
                onRolesChange={(newRoles) => setFormData(prev => ({ ...prev, roles: newRoles }))}
              />
            </Box>
          </StyledElements.FormContent>
          
          <StyledElements.FormActions>
            <StyledElements.CancelButton 
              onClick={onClose}
              disabled={isSubmitting}
              variant="outlined"
            >
              Cancelar
            </StyledElements.CancelButton>
            <StyledElements.SubmitButton 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Crear'}
            </StyledElements.SubmitButton>
          </StyledElements.FormActions>
        </form>
      </Box>
    </FormContainer>
  );
};
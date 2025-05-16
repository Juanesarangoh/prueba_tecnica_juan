//Maneja todas las interacciones con la API de usuarios
 
import { User } from '../types/User';

// URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function handleResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error en el servidor' }));
        console.error('Error de respuesta API:', errorData);
        
        // Manejo para errores de validación (express-validator)
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            const fieldErrors = errorData.errors.reduce((acc: any, error: any) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            
            const message = errorData.errors[0].msg || 'Error de validación';
            
            const enhancedError = new Error(message) as Error & { fieldErrors?: any };
            enhancedError.fieldErrors = fieldErrors;
            throw enhancedError;
        }
        
        throw new Error(errorData.error || 'Se ha presentado un error procesando tu solicitud');
    }
    return response.json();
}

export const userService = {
    // Obtiene la lista complta de usuarios
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_URL}/users`);
        return handleResponse(response);
    },

    
     // Elimina un usuario por su tipo y número de documento
    async deleteUser(tipoDocumento: string, numeroDocumento: string): Promise<void> {
        const response = await fetch(`${API_URL}/users/${tipoDocumento}/${numeroDocumento}`, {
            method: 'DELETE',
        });
        await handleResponse(response);
    },

    
     // Crea un nuevo usuario
    async createUser(userData: Omit<User & { password: string }, 'id'>): Promise<User> {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        return handleResponse(response);
    }
};
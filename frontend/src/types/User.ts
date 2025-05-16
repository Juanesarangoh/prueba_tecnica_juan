/**
 * Interfaz que define la estructura de un usuario en el sistema
 * Esta interfaz es compartida entre el frontend y el backend
 */
export interface User {
    /** ID único del usuario - Campo requerido */
    id: number;

    /** Nombre(s) del usuario - Campo requerido */
    nombres: string;

    /** Apellidos del usuario - Campo requerido */
    apellidos: string;

    /** Tipo de documento (CC, CE, PA) - Campo requerido */
    tipoDocumento: string;

    /** 
     * Número de documento - Campo requerido
     * Debe ser numérico y no exceder 20 dígitos
     */
    numeroDocumento: string;

    /** 
     * Número de celular - Campo opcional
     * Si se proporciona, debe ser numérico y tener 10 dígitos
     */
    celular?: string;

    /** Convenio asociado al usuario - Campo opcional */
    convenio?: string;

    /** Coordinador asignado al usuario - Campo opcional */
    coordinador?: string;

    /** Centro de costos del usuario - Campo opcional */
    centroCostos?: string;

    /** Documento del aliado - Campo opcional */
    documentoAliado?: string;

    /** Nombre del aliado - Campo opcional */
    nombreAliado?: string;

    /** 
     * Roles asignados al usuario - Campo opcional
     * Puede incluir: 'acreedor', 'aprobador', 'coordinador', 'conductor'
     */
    roles?: string[];
}
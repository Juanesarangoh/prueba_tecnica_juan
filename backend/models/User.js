const fs = require('fs').promises;
const path = require('path');

// Ruta al archivo JSON donde se almacenan los usuarios
const dataPath = path.join(__dirname, process.env.DATA_PATH);

class User {
    constructor({
        id,
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        celular,
        convenio,
        coordinador,
        password,
        centroCostos,
        documentoAliado,
        nombreAliado,
        roles
    }) {
        this.id = typeof id === 'number' && !isNaN(id) ? id : null;
        
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.celular = celular || '';
        this.convenio = convenio || '';
        this.coordinador = coordinador || '';
        this.password = password || '';
        this.centroCostos = centroCostos || '';
        this.documentoAliado = documentoAliado || '';
        this.nombreAliado = nombreAliado || '';
        this.roles = Array.isArray(roles) ? roles : [];
    }

    
     // Genera un ID único incremental basado en el último ID existente
    static async generateId() {
        try {
            const users = await this.getAllUsers();
            if (!Array.isArray(users) || users.length === 0) return 1;

            const maxId = users.reduce((max, user) => {
                const userId = typeof user.id === 'number' ? user.id : 0;
                return Math.max(max, userId);
            }, 0);

            return maxId + 1;
        } catch (error) {
            console.error('Error generating ID:', error);
            throw new Error('Error al generar ID de usuario');
        }
    }

    
     // Convierte el usuario a un objeto JSON
    toJSON() {
        return {
            id: this.id,
            nombres: this.nombres,
            apellidos: this.apellidos,
            tipoDocumento: this.tipoDocumento,
            numeroDocumento: this.numeroDocumento,
            celular: this.celular,
            convenio: this.convenio,
            coordinador: this.coordinador,
            password: this.password,
            centroCostos: this.centroCostos,
            documentoAliado: this.documentoAliado,
            nombreAliado: this.nombreAliado,
            roles: this.roles
        };
    }

   
     // Obtiene todos los usuarios del archivo JSON
    static async getAllUsers() {
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(dataPath, '[]');
                return [];
            }
            throw error;
        }
    }

   
     // Busca un usuario por tipo y número de documento
    static async findByDocument(tipoDocumento, numeroDocumento) {
        const users = await this.getAllUsers();
        return users.find(user => 
            user.tipoDocumento === tipoDocumento && 
            user.numeroDocumento === numeroDocumento
        );
    }

    
     // Guardar usuario en el archivo JSON
    async save() {
        try {
            if (!this.id || typeof this.id !== 'number' || isNaN(this.id)) {
                this.id = await User.generateId();
            }

            const users = await User.getAllUsers();
            const userData = {
                id: this.id,
                nombres: this.nombres,
                apellidos: this.apellidos,
                tipoDocumento: this.tipoDocumento,
                numeroDocumento: this.numeroDocumento,
                celular: this.celular,
                convenio: this.convenio,
                coordinador: this.coordinador,
                password: this.password,
                centroCostos: this.centroCostos,
                documentoAliado: this.documentoAliado,
                nombreAliado: this.nombreAliado,
                roles: this.roles
            };

            users.push(userData);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
            return userData;
        } catch (error) {
            console.error('Error saving user:', error);
            throw new Error('Error al guardar usuario');
        }
    }

    
      // Elimina un usuario por tipo y número de documento
    static async deleteUser(tipoDocumento, numeroDocumento) {
        const users = await this.getAllUsers();
        const initialLength = users.length;
        const filteredUsers = users.filter(user => 
            !(user.tipoDocumento === tipoDocumento && user.numeroDocumento === numeroDocumento)
        );
        
        if (filteredUsers.length < initialLength) {
            await fs.writeFile(dataPath, JSON.stringify(filteredUsers, null, 2));
            return true;
        }
        return false;
    }
}

module.exports = User;
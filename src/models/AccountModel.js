// Modelo para Cuentas
class AccountModel {
    constructor(id_cuenta, id_usuario, NombreCuenta, Dinero, createdAt, updatedAt) {
        this.id_cuenta = id_cuenta;
        this.id_usuario = id_usuario;
        this.NombreCuenta = NombreCuenta;
        this.Dinero = Dinero;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id_cuenta: this.id_cuenta,
            id_usuario: this.id_usuario,
            NombreCuenta: this.NombreCuenta,
            Dinero: this.Dinero,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
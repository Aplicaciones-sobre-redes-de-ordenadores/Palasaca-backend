class MovementModel {
  constructor(id_movimiento, id_cuenta, Tipo, Fijo, Categoria, Comentarios, Cantidad, createdAt, updatedAt) {
    this.id_movimiento = id_movimiento;
    this.id_cuenta = id_cuenta;
    this.Tipo = Tipo;
    this.Fijo = Fijo;
    this.Categoria = Categoria;
    this.Comentarios = Comentarios;
    this.Cantidad = Cantidad;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id_movimiento: this.id_movimiento,
      id_cuenta: this.id_cuenta,
      Tipo: this.Tipo,
      Fijo: this.Fijo,
      Categoria: this.Categoria,
      Comentarios: this.Comentarios,
      Cantidad: this.Cantidad,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Movement;

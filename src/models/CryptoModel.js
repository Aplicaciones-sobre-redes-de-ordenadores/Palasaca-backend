// Modelo para Criptomonedas
class CryptoModel {
  constructor(id, simbolo, precio, variacionPrecio, createdAt, updatedAt) {
    this.id = id;
    this.simbolo = simbolo;
    this.precio = precio;
    this.variacionPrecio = variacionPrecio;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      simbolo: this.simbolo,
      precio: this.precio,
      variacionPrecio: this.variacionPrecio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = CryptoModel;
